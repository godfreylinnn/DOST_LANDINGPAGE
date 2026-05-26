import json
import os
from pathlib import Path
from urllib.parse import quote

from dotenv import load_dotenv
from flask import Flask, render_template, request, jsonify, redirect
from supabase import create_client
from werkzeug.utils import secure_filename

load_dotenv()

# Initialize Flask
app = Flask(__name__, static_folder='static')

# Set up paths
BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
FILES_DIR = BASE_DIR / "static" / "assets" / "files"
SUPABASE_BUCKET = os.environ.get("SUPABASE_BUCKET", "files")
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
SUPABASE_SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
USE_SUPABASE_UPLOADS = os.environ.get("SUPABASE_UPLOADS", "true").lower() != "false"
FORM_CATEGORIES = [
    "PM-DOST-VIII (Quality Management / CSM / Meeting Forms)",
    "PM-FAS-SPO (Finance and Administrative Services / Supply & Property)",
    "GIA",
]

# Ensure directories exist
FILES_DIR.mkdir(parents=True, exist_ok=True)
DATA_DIR.mkdir(parents=True, exist_ok=True)


def get_supabase_client(use_service_role=False):
    key = SUPABASE_SERVICE_ROLE_KEY if use_service_role else SUPABASE_KEY
    if not SUPABASE_URL or not key:
        return None
    return create_client(SUPABASE_URL, key)


def unique_file_path(directory, filename):
    path = directory / filename
    if not path.exists():
        return path

    stem = path.stem
    suffix = path.suffix
    counter = 1
    while True:
        candidate = directory / f"{stem}-{counter}{suffix}"
        if not candidate.exists():
            return candidate
        counter += 1


def save_file_reference(category, ref):
    json_path = DATA_DIR / "files.json"
    data = json.loads(json_path.read_text(encoding="utf-8")) if json_path.exists() else {}

    if category not in data:
        data[category] = []

    if ref not in data[category]:
        data[category].append(ref)
        json_path.write_text(json.dumps(data, indent=4), encoding="utf-8")


def supabase_download_ref(storage_path, display_name):
    encoded_path = quote(storage_path, safe="/")
    return {
        "name": display_name,
        "url": f"/api/download/{encoded_path}",
        "storage": "supabase",
        "path": storage_path,
    }


def list_supabase_files_by_category(category):
    supabase = get_supabase_client(use_service_role=True)
    if supabase is None:
        return []

    safe_category = secure_filename(category) or "uncategorized"
    try:
        items = supabase.storage.from_(SUPABASE_BUCKET).list(safe_category)
    except Exception:
        return []

    refs = []
    for item in items or []:
        name = item.get("name") if isinstance(item, dict) else getattr(item, "name", None)
        if not name or name == ".emptyFolderPlaceholder":
            continue
        refs.append(supabase_download_ref(f"{safe_category}/{name}", name))
    return refs

# 1. Main Route
@app.route('/')
def index():
    return render_template('index.html')

# 2. API: Files
@app.route('/api/files', methods=['GET'])
def get_files():
    json_path = DATA_DIR / "files.json"
    data = json.loads(json_path.read_text(encoding="utf-8")) if json_path.exists() else {}

    if USE_SUPABASE_UPLOADS:
        for category in FORM_CATEGORIES:
            data.setdefault(category, [])
            known = {json.dumps(item, sort_keys=True) if isinstance(item, dict) else item for item in data[category]}
            for ref in list_supabase_files_by_category(category):
                key = json.dumps(ref, sort_keys=True)
                if key not in known:
                    data[category].append(ref)
                    known.add(key)

    return jsonify(data)

# 3. API: Upload
@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files or 'category' not in request.form:
        return jsonify({"error": "Missing fields"}), 400
    
    file = request.files['file']
    category = request.form['category']
    if not file.filename:
        return jsonify({"error": "No file selected"}), 400

    safe_filename = secure_filename(Path(file.filename).name)
    if not safe_filename:
        return jsonify({"error": "Invalid file name"}), 400

    safe_category = secure_filename(category) or "uncategorized"

    if USE_SUPABASE_UPLOADS:
        supabase = get_supabase_client(use_service_role=True)
        if supabase is None:
            return jsonify({
                "error": "Supabase uploads need SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env."
            }), 500

        storage_path = f"{safe_category}/{safe_filename}"
        file_options = {
            "content-type": file.content_type or "application/octet-stream",
            "upsert": "true",
        }

        try:
            supabase.storage.from_(SUPABASE_BUCKET).upload(
                storage_path,
                file.read(),
                file_options,
            )
        except Exception as exc:
            return jsonify({
                "error": "Supabase upload failed. Check that SUPABASE_SERVICE_ROLE_KEY is set and the bucket exists.",
                "details": str(exc),
            }), 500

        ref = supabase_download_ref(storage_path, safe_filename)
    else:
        destination = unique_file_path(FILES_DIR, safe_filename)
        file.save(destination)
        ref = f"files/{destination.name}"

    save_file_reference(category, ref)
    return jsonify({"success": True, "url": ref})


@app.route('/api/download/<path:storage_path>', methods=['GET'])
def download_supabase_file(storage_path):
    supabase = get_supabase_client(use_service_role=True)
    if supabase is None:
        return jsonify({"error": "Supabase downloads need SUPABASE_SERVICE_ROLE_KEY in .env."}), 500

    try:
        signed = supabase.storage.from_(SUPABASE_BUCKET).create_signed_url(storage_path, 60)
    except Exception as exc:
        return jsonify({"error": f"Could not create download link: {exc}"}), 500

    if isinstance(signed, dict):
        signed_url = signed.get("signedURL") or signed.get("signed_url") or signed.get("signedUrl")
    else:
        signed_url = signed

    if not signed_url:
        return jsonify({"error": "Supabase did not return a signed download URL."}), 500

    return redirect(signed_url)

# 4. API: Profile
@app.route('/api/profile', methods=['GET'])
def get_profile():
    json_path = DATA_DIR / "profile.json"
    if not json_path.exists():
        return jsonify({"error": "Profile data not found"}), 404
    with open(json_path, 'r', encoding='utf-8') as f:
        return jsonify(json.load(f))

# 5. API: Systems
@app.route('/api/systems', methods=['GET'])
def get_systems():
    json_path = DATA_DIR / "systems.json"
    if not json_path.exists():
        return jsonify({"error": "Systems data not found"}), 404
    with open(json_path, 'r', encoding='utf-8') as f:
        return jsonify(json.load(f))

# ONLY start the server at the very end
if __name__ == "__main__":
    app.run(port=8000, debug=True)

from flask import jsonify


def success(data=None, message="OK", status=200):
    payload = {
        "success": True,
        "message": message,
        "data": data or {},
    }
    return jsonify(payload), status


def error(message, status=400, details=None):
    payload = {
        "success": False,
        "message": message,
    }
    if details is not None:
        payload["details"] = details
    return jsonify(payload), status

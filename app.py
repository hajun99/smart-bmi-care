from flask import Flask, jsonify, render_template, request

from bmi_calculator import calculate_bmi_result

app = Flask(__name__)


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/api/calculate", methods=["POST"])
def calculate():
    data = request.get_json(silent=True) or {}
    required_fields = ["height", "weight", "age", "gender", "activity"]

    if not all(field in data for field in required_fields):
        return jsonify({"error": "필수 입력 항목이 부족합니다."}), 400

    try:
        result = calculate_bmi_result(data)
    except (TypeError, ValueError) as error:
        return jsonify({"error": str(error)}), 400

    return jsonify(result)


if __name__ == "__main__":
    app.run(debug=True)
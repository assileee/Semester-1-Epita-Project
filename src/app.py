from flask import Flask, jsonify, request
import mysql.connector
from flask_cors import CORS
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
CORS(app)

DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")

@app.route('/get-population-data')
def population_stats():
    try:
        conn = mysql.connector.connect(
            host=DB_HOST,
            port=DB_PORT,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD
        )
        cursor = conn.cursor(dictionary=True)
        query = """
            SELECT 
                student_population_code_ref, 
                student_population_period_ref, 
                student_population_year_ref, 
                COUNT(*) AS student_count
            FROM 
                students 
            WHERE 
                student_enrollment_status = 'completed'
            GROUP BY 
                student_population_code_ref, 
                student_population_period_ref, 
                student_population_year_ref
            ORDER BY 
                student_population_year_ref ASC, 
                student_population_period_ref ASC;
        """
        cursor.execute(query)
        rows = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify({"success": True, "students": rows})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

@app.route('/get-all-students', methods=['POST'])
def get_all_students():
    try:
        data = request.get_json()
        discipline = data.get('discipline')
        conn = mysql.connector.connect(
            host=DB_HOST,
            port=DB_PORT,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD
        )
        cursor = conn.cursor(dictionary=True)
        query = """
            SELECT
                student_epita_email,
                SUBSTRING_INDEX(SUBSTRING_INDEX(student_epita_email, '@', 1), '.', 1) AS first_name,
                SUBSTRING_INDEX(SUBSTRING_INDEX(student_epita_email, '@', 1), '.', -1) AS last_name,
                student_population_period_ref AS intake_period,
                student_population_year_ref AS intake_year,
                COUNT(DISTINCT CASE WHEN avg_grade > 10 THEN grade_course_code_ref ELSE NULL END) AS passed
            FROM students
            LEFT JOIN (
                SELECT
                    grade_student_epita_email_ref,
                    grade_course_code_ref,
                    AVG(grade_score) AS avg_grade
                FROM grades
                GROUP BY grade_student_epita_email_ref, grade_course_code_ref
            ) AS course_averages ON students.student_epita_email = course_averages.grade_student_epita_email_ref
            WHERE student_population_code_ref = %s
            AND student_enrollment_status = 'completed'
            GROUP BY student_epita_email, student_population_period_ref, student_population_year_ref;
        """
        cursor.execute(query, (discipline,))
        rows = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify({"success": True, "students": rows})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

@app.route('/get-courses-per-discipline', methods=['POST'])
def get_grades():
    try:
        conn = mysql.connector.connect(
            host=DB_HOST,
            port=DB_PORT,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD
        )

        data = request.get_json()
        discipline = data.get('discipline')
        cursor = conn.cursor(dictionary=True)

        query = """
            SELECT DISTINCT c.course_code, c.course_name, c.duration
            FROM students st
            JOIN grades s ON st.student_epita_email = s.grade_student_epita_email_ref
            JOIN courses c ON s.grade_course_code_ref = c.course_code
            WHERE st.student_population_code_ref = %s
            AND st.student_enrollment_status = 'completed'
            AND s.grade_course_code_ref IS NOT NULL;
        """

        cursor.execute(query, (discipline,))
        rows = cursor.fetchall()
        cursor.close()
        conn.close()

        return jsonify({"success": True, "courses": rows})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

@app.route('/get-students-grades-per-course', methods=['POST'])
def get_per_course():
    try:
        conn = mysql.connector.connect(
            host=DB_HOST,
            port=DB_PORT,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD
        )

        data = request.get_json()
        discipline = data.get('discipline')
        courseCode = data.get('courseCode')
        cursor = conn.cursor(dictionary=True)

        query = """
            SELECT st.student_epita_email, c.course_code, c.course_name,
            AVG(s.grade_score) AS average_grade,st.student_population_year_ref, st.student_population_period_ref 
            FROM students st
            JOIN grades s ON st.student_epita_email = s.grade_student_epita_email_ref
            JOIN courses c ON s.grade_course_code_ref = c.course_code
            WHERE st.student_population_code_ref = %s
            AND st.student_enrollment_status = 'completed'
            AND s.grade_course_code_ref IS NOT NULL
            AND c.course_code = %s
            GROUP BY st.student_epita_email, c.course_code, c.course_name;
        """
        cursor.execute(query, (discipline, courseCode))
        rows = cursor.fetchall()
        cursor.close()
        conn.close()

        return jsonify({"success": True, "courses": rows})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

@app.route('/get-all-attendance')
def attendance():
    try:
        conn = mysql.connector.connect(
            host=DB_HOST,
            port=DB_PORT,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD
        )
        cursor = conn.cursor(dictionary=True)
        query= """
        SELECT DISTINCT(program_assignment),
        (COUNT(CASE WHEN attendance_presence = '1' THEN 1 END) * 100.0 / COUNT(*)) AS PresencePercentage 
        FROM students s 
        JOIN attendance a ON attendance_student_ref = student_epita_email
        JOIN programs p ON attendance_course_ref = program_course_code_ref
        GROUP BY program_assignment;
        """
        cursor.execute(query)
        rows = cursor.fetchall()
        cursor.close()
        conn.close()
        return jsonify({"success": True, "attendance": rows})
    except Exception as e:
        return f"Failed to connect to database: {e}"

if __name__ == '__main__':
    app.run(debug=True)

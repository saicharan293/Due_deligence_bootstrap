from flask import Flask, render_template, request, jsonify, url_for
from flask_sqlalchemy import SQLAlchemy
import psycopg2
from flask_cors import CORS
from sqlalchemy.dialects.postgresql import JSON


app = Flask(__name__)
CORS(app)

# Configure the PostgreSQL database
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:Admin@localhost:5432/DueDeligenceDb'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize SQLAlchemy
db = SQLAlchemy(app)

# Function to create the database if it doesn't exist
def create_database():
    conn = psycopg2.connect(dbname='postgres', user='postgres',port=5432, password='Admin', host='localhost')
    conn.autocommit = True
    cursor = conn.cursor()
    
    # Check if database exists
    cursor.execute("SELECT 1 FROM pg_database WHERE datname = 'DueDeligenceDb'")
    exists = cursor.fetchone()
    
    # cursor.execute('DROP DATABASE "DueDeligenceDb"') 
    if not exists:
        cursor.execute('CREATE DATABASE "DueDeligenceDb"')
        print("Database 'DueDeligenceDb' created!")
    
    cursor.close()
    conn.close()

create_database()

# Define Department Model
class Department(db.Model):
    __tablename__ = 'department'
    id = db.Column(db.Integer, primary_key=True)
    deptname = db.Column(db.String(500), nullable=False)

class TableData(db.Model):
    __tablename__ = 'table_data'
    id = db.Column(db.Integer, primary_key=True)  # Primary key
    table_name = db.Column(db.String(255), nullable=False)  # Name of the table
    columns = db.Column(JSON, nullable=False)  # Columns stored as JSON
    row_data = db.Column(JSON, nullable=True)  # Row data stored as JSON (can be nullable)

with app.app_context():
    db.create_all()
    print("All tables created successfully!")

# global_table_data=None
@app.route('/')
def indexPage():
    departments = Department.query.all()
    return render_template('due_deligence.html', departments=departments)


@app.route('/submit-table-data', methods=['POST'])
def submit_table_data():
    data = request.json
    new_table  = data.get('tableData')
    
    table_name = new_table[0].get('tableName')  # Extract table name
    columns = new_table[1].get('columns')  # Extract columns list
    row_data = new_table[0].get('rowData')  # Extract row data

# Create a new TableData instance
    table_entry = TableData(
        table_name=table_name,
        columns=columns,
        row_data=row_data
    )
    # Add and commit to the database
    db.session.add(table_entry)
    db.session.commit()
    print('Received table data:', table_entry)

    # Return a JSON response with the redirect URL
    return jsonify({'redirect': url_for('due_deligence')})

@app.route('/due-deligence')
def due_deligence():
    return render_template( 'due-deligence.html')

@app.route('/get-table-data', methods=['GET'])
def get_table_data():
    # Query all rows from the table_data table
    all_table_data = TableData.query.all()
    
    # Extract table_name and columns from each row
    tables = []
    for table in all_table_data:
        table_info = {
            'tableName': table.table_name,
            'columns': table.columns
        }
        tables.append(table_info)
    
    # Return the data as JSON
    return jsonify(tables)

if __name__ == '__main__':
    app.run(debug=True)
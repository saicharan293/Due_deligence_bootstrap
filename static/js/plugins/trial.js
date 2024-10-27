function showError(selector, message) {
    const errorElement = document.querySelector(selector);
    errorElement.classList.add("error");
    errorElement.innerText = message;
    errorElement.style.display = "block";
}
  
function removeError(selector) {
    const errorElement = document.querySelector(selector);
    errorElement.classList.remove("error");
    errorElement.innerText = "";
    errorElement.style.display = "none";
}

// function getData(){
document.addEventListener('DOMContentLoaded', function() {
    fetch('/get-table-data')
    .then(response => response.json())
    .then(tables  => {
        console.log('Retrieved table data from server:', tables );
        tables.forEach(tableData => {
            displayTableData(tableData); 
        });
    })
    .catch(error => {
        console.error('Error fetching table data:', error);
    });
});
// }

// Function to display the fetched data in the table
function displayTableData(tableData) {
    // Get the reference to the existing table's tbody
    const tbody = document.getElementById("tbody");

    // Destructure table name and columns for readability
    const departmentName = tableData.department; // Department name
    const screenName = tableData.screenName; // Department name
    const id=tableData.id;
    // const columns = tableData[1].columns;
        const row = document.createElement("tr");

        // Department column (first cell, single row span for all assets)
        const departmentCell = document.createElement("td");
        departmentCell.textContent = departmentName;
        row.appendChild(departmentCell);

        // Assets column
        const assetsCell = document.createElement("td");
        assetsCell.textContent = screenName;
        row.appendChild(assetsCell);

        // Action column with edit and delete buttons
        const actionCell = document.createElement("td");
        actionCell.innerHTML = `
            <i class="material-icons"><a class="edit edit-btn" title="Edit" id="${screenName}" style="cursor: pointer;" >
                &#xE254;
            </a></i>
            <i class="material-icons"><a class="delete delete-btn " title="Delete" style="cursor: pointer;" id="${id}" >
                &#xE872;</a>
            </i>
            
        `;
        row.appendChild(actionCell);

        // Append the new row to the tbody
        tbody.appendChild(row);
    // });
}


document.addEventListener('click', async function(event) {
    const editButton = event.target.closest('.edit-btn');
    if (editButton) {
        const screenName = editButton.id;  // Get the screen name from the button ID
        console.log('Screen name is', screenName);

        try {
            // Fetch data from the Flask API
            const fetchUrl = `/edit-table-data?screen_name=${encodeURIComponent(screenName)}`;
            const response = await fetch(fetchUrl);
            if (!response.ok) throw new Error("Data fetch failed");

            const data = await response.json();
            if (data.length === 0) {
                console.error("No data found for this screen name.");
                return;
            }

            // Use the first entry if multiple records (adapt based on API response structure)
            const tableData = data;
            console.log('tabel data', tableData)

            // Redirect to '/' with data in URL parameters (you may need to serialize complex objects)
            const redirectUrl = `/?tabledataId=${encodeURIComponent(tableData.tabledataId)}&deptname=${encodeURIComponent(tableData.deptname)}&screen_name=${encodeURIComponent(tableData.screen_name || "")}&columns=${encodeURIComponent(JSON.stringify(tableData.columns))}&row_data=${encodeURIComponent(JSON.stringify(tableData.row_data))}`;
            window.location.href = redirectUrl;

        } catch (error) {
            console.error("Error fetching table data:", error);
        }
    }
});

document.addEventListener('click', async function(event) {
    const deleteButton = event.target.closest('.delete-btn'); // Assuming you have a class 'delete-btn'
    if (deleteButton) {
        const id = deleteButton.id; // Assuming the id is stored in a data attribute
        console.log('Deleting entry with id:', id);

        try {
            const response = await fetch(`/delete-table-data/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error("Delete failed");

            const result = await response.json();
            // console.log(result.message); 
            window.location.href = '/all-reports';

        } catch (error) {
            console.error("Error deleting entry:", error);
        }
    }
});



document.getElementById("evaluationForm").addEventListener("submit", function (event) {
    event.preventDefault();
    const category =  document.getElementById("category").value;
    const deptSelect = document.getElementById("category"); 
    const selectedOption = deptSelect.options[deptSelect.selectedIndex];

    // Get the department ID directly from the selected option's id attribute
    const deptidNumeric = selectedOption.id;

    // If you're using a format like "dept-1" and want just the numeric part, use:
    const deptid = parseInt(deptidNumeric);
    // console.log('dept id',deptid)
    const screenName = document.querySelector('.screen-name').value.trim();
    // const subcategory = document.getElementById("subcategory").value.trim() || document.getElementById("subcategory").value;
    const countData = document.querySelector('.count-data').value.trim();
    // let isValid = true;
    if(formValidation()){
        var deptname = `${category.replace(/\s+/g, '_')}`;
        var screen=`${screenName.replace(/\s+/g, '_')}`;
        
        tableCreation(screen,countData,deptid);
        document.querySelector("#evaluationForm").reset();
        // formdataReset(category,)
        window.history.replaceState({}, document.title, "/");
    }
});

window.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const deptname = urlParams.get('deptname');
    const screenName = urlParams.get('screen_name');
    const tabledataId = urlParams.get('id')
    const columns = JSON.parse(urlParams.get('columns') || "[]");
    const rowData = JSON.parse(urlParams.get('row_data') || "[]");

    // Check if in edit mode by verifying if deptname and screenName exist
    if (deptname && screenName) {
        // Pre-fill form fields for editing
        document.getElementById("category").value = deptname.replace('_', ' ');  // Assuming deptname matches option text
        document.querySelector('.screen-name').value = screenName.replace('_', ' ');

        // Call table creation with existing column and row data
        tableCreation(screenName, columns.length, deptname, columns, rowData);
    }
});

document.querySelector(".reset-btn").addEventListener('click', function (event ){
    event.preventDefault();
    console.log('reset started')
    removeError('.department-error')
    removeError('.count-error')
    removeError('.screen-error')
    document.querySelector("#evaluationForm").reset();
})

function formValidation(){
    const category = document.getElementById("category").value;
    const screenName = document.querySelector('.screen-name').value.trim();
    const countData = document.querySelector('.count-data').value.trim();
    let isValid = true;
    // Ensure category and subcategory are selected before building the table
    
    console.log('entering form')
    if (!category ) {
        // Send data to the server
        showError('.department-error', 'Please select department');
        isValid = false;
    } else {
        removeError('.department-error');
    }
    if (screenName === ""){
        console.log('screen name error')
        showError('.screen-error', "Please enter screen name");
        isValid = false
    } else {
        removeError('.screen-error');
    }
    if (countData == 0){
        console.log('count data error')
        showError('.count-error', "Please enter valid count value");
        isValid = false
    } else {
        removeError('.count-error');
    }
    
    return isValid;
}

// let tableData = [];
// screen,countData,deptid,columns,deptname
function tableCreation(screenName, count, deptid, columns = [], rowData = []) {
    const tablesContainer = document.querySelector('.infra-table'); // Infra-table as the container

    // Create a card structure similar to the reference template
    const newSection = document.createElement("div");
    newSection.classList.add("col-xl-12", screenName);
    
    newSection.innerHTML = `
        <div class="card mt-3">
            <div class="card-header">
                <h5>${screenName}</h5>
            </div>
            <div class="card-body table-border-style">
                <div class="table-responsive">
                    <table class="table table-striped" id="${screenName}">
                        <thead>
                            <tr id="${screenName}-thead">
                                <!-- Dynamic columns will be added here -->
                            </tr>
                        </thead>
                        <tbody id="${screenName}-tbody">
                            <!-- Dynamic rows will be added here -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    // Add the card to the container
    tablesContainer.appendChild(newSection);

    // Create the table header
    // const tableheader = document
    const headerRow = document.getElementById(`${screenName}-thead`);
    const tbody = document.getElementById(`${screenName}-tbody`);
    // const rowData = {};

    // Create columns with editable feature
    // edit mode 
    if (columns.length > 0) {
        for (let i = 0; i < columns.length; i++) {
            const th = document.createElement("th");
            const columnText = columns[i];
            // console.log(columnText)
            
            th.innerHTML = `
                <span class="editable-column" contenteditable="true">${columnText}</span>
                <a class="edit" title="Edit" data-toggle="tooltip">
                    <i class="fa fa-pencil"></i>
                </a>`;
            
            th.style.position = "relative";
            headerRow.appendChild(th);
        }
    } else {
        for (let i = 1; i <= count; i++) {
            const th = document.createElement("th");
            const columnText = `Column${i}`;
            th.innerHTML = `
                <span class="editable-column" contenteditable="true">${columnText}</span>
                <a class="edit" title="Edit" data-toggle="tooltip">
                    <i class="fa fa-pencil"></i>
                </a>`;
            
            th.style.position = "relative";
            headerRow.appendChild(th);
        }
    }
    
    const emptyRow = document.createElement("tr");
    const rowStore = {};

    if (rowData.length > 0) {
        // const emptyRow = document.createElement("tr");
        columns.forEach((columnName, index) => {
            const td = document.createElement("td");
            const inputType = rowData[`Column${index + 1}`] || "text"; // Get input type or default to "textbox"
            console.log('input type', inputType)
        
            // Create the dropdown (select) element
            const inputElement = document.createElement("select");
            inputElement.className = "form-control input-type-selector";
        
            // Define available options
            const options = ["Textbox", "Textarea", "Date", "Dropdown"];
            
            options.forEach(option => {
                const opt = document.createElement("option");
                opt.value = option.toLowerCase();  // Set the option's value
                opt.textContent = option;          // Set the option's display text
                
                // Set this option as selected if it matches inputType
                if (opt.value === inputType.toLowerCase()) {
                    opt.selected = true;
                }
                
                inputElement.appendChild(opt);
            });
        
            // Append the populated dropdown to the table cell
            td.appendChild(inputElement);
            emptyRow.appendChild(td);
        });
        
    
        tbody.appendChild(emptyRow);
    } else {
        // Add empty row if not in edit mode
        for (let i = 0; i < count; i++) {
            const td = document.createElement("td");
            const inputTypeSelector = document.createElement("select");
            inputTypeSelector.className = "form-control input-type-selector";
            
            ["Select", "Text", "Textarea", "Date","Radio", "Dropdown"].forEach(option => {
                const opt = document.createElement("option");
                opt.value = option.toLowerCase();
                opt.textContent = option;
                inputTypeSelector.appendChild(opt);
            });
            inputTypeSelector.addEventListener('change', function () {
                rowStore[`Column${i + 1}`] = this.value;
            });

            td.appendChild(inputTypeSelector);
            emptyRow.appendChild(td);
        }
        tbody.appendChild(emptyRow);

    // tbody.appendChild(dataRow);

    // Add submit and reset buttons
    }
    const buttonsDiv = document.createElement('div');
    buttonsDiv.className = "submit-table mt-3";
    buttonsDiv.innerHTML = `
        <button type="submit" class="btn btn-primary" id="save-table" >Save</button>
        <button type="reset" class="btn btn-warning" id="reset-table">Reset</button>
        <button class="btn btn-info back-btn" id="back-btn">Back</button>
    `;
    newSection.appendChild(buttonsDiv);

    document.addEventListener('click', function (event) {
        if (event.target && event.target.id === 'reset-table') {
            // Reset each input type selector to "Select"
            const inputTypeSelectors = newSection.querySelectorAll('.input-type-selector');
            inputTypeSelectors.forEach(selector => {
                selector.value = 'select'; // Reset to default
            });
        }
    });
    // Store row data in tableData array upon submission
    document.getElementById('save-table').addEventListener('click', function () {
        // tableData.push({ screenName, rowData, deptname, deptid });
        saveTable(screenName,rowStore,deptid)
        submitbtn.classList.add('disabled');
        submitbtn.disabled = true;
    });
    document.getElementById('back-btn').addEventListener('click',function(){
        window.location.href = '/all-reports';
    })
}




document.getElementById("category").addEventListener("change", function () {
    removeError('.department-error'); // Remove department error when the dropdown is changed
});

document.querySelector('.screen-name').addEventListener("input", function () {
    removeError('.screen-error'); // Remove screen name error when the user starts typing
});

document.querySelector('.count-data').addEventListener("input", function () {
    removeError('.count-error'); 
});


function saveTable(screenName,rowData,deptid){
    document.addEventListener('click', function (event) {
        const columns = []
        if (event.target && event.target.id === 'save-table') {
            document.querySelectorAll('.editable-column').forEach(ele=>{
                columns.push(ele.innerText)
            })
            const tableData = {
                screen_name: screenName,
                columns: columns,
                row_data: rowData,
                department_id: deptid,
            };
            console.log('rev data', tableData);
            fetch('/submit-table-data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(tableData)
            })
            .then(response => {
                if (response.ok) {
                    // Handle success if needed (optional)
                    console.log('Successfully submitted data');
                    // getData();
                    window.location.href = '/all-reports';

                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
        }
    });
}

document.addEventListener('click', function(e){
    const editButton = e.target.closest('.edit-btn');
    if(editButton){
        const screenName=editButton.id;
        console.log('screen name is',screenName)
    }
})


// Function to make the column names editable
function makeEditable(event) {
    const th = event.currentTarget;
    const columnText = th.querySelector('.editable-column');
    const editButton = th.querySelector('.edit');
    
    // Check if the column is already being edited
    if (columnText.isContentEditable) {
        return;
    }

    // Make column content editable and focus on it
    columnText.contentEditable = "true";
    columnText.focus();

    // Save on blur (clicking outside) or pressing 'Enter'
    columnText.addEventListener('blur', () => saveColumnName(columnText));
    columnText.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            columnText.blur();
        }
    });
}




// Function to save the new column name
function saveColumnName(columnText) {
    columnText.contentEditable = "false"; // Disable contentEditable
    // Optionally: Send the new column name to the backend if needed
}
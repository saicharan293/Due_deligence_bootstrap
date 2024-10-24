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



document.getElementById("evaluationForm").addEventListener("submit", function (event) {
    event.preventDefault();
    const screenName = document.querySelector('.screen-name').value.trim();
    const subcategory = document.getElementById("subcategory").value.trim() || document.getElementById("subcategory").value;
    const countData = document.querySelector('.count-data').value.trim();
    // let isValid = true;
    if(formValidation()){
        var tableName="";
        if(subcategory){
            tableName=`${category.replace(/\s+/g, '_')}_${subcategory.replace(/\s+/g, '_')}_${screenName.replace(/\s+/g, '_')}`;
        } else{
            tableName=`${category.replace(/\s+/g, '_')}_${screenName.replace(/\s+/g, '_')}`;
        }
        tableCreation(tableName,countData);
        document.querySelector("#evaluationForm").reset();
    }
    // formValidation(isValid)
    // Reset the form after creating the table
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
    const category = document.getElementById("customCategory").value.trim() || document.getElementById("category").value;
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

let tableData = [];

function tableCreation(tableName, count) {
    const tablesContainer = document.querySelector('.infra-table'); // Infra-table as the container

    // Create a card structure similar to the reference template
    const newSection = document.createElement("div");
    newSection.classList.add("col-xl-12", tableName);
    
    newSection.innerHTML = `
        <div class="card mt-3">
            <div class="card-header">
                <h5>${tableName}</h5>
            </div>
            <div class="card-body table-border-style">
                <div class="table-responsive">
                    <table class="table table-striped" id="${tableName}">
                        <thead>
                            <tr id="${tableName}-thead">
                                <!-- Dynamic columns will be added here -->
                            </tr>
                        </thead>
                        <tbody id="${tableName}-tbody">
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
    const headerRow = document.getElementById(`${tableName}-thead`);
    // const headerRow = document.createElement("tr");

    const rowData = {};

    // Create columns with editable feature
    if (count > 0) {
        for (let i = 1; i <= count; i++) {
            const th = document.createElement("th");
            const columnText = `Column${i}`;
            
            th.innerHTML = `
                <span class="editable-column">${columnText}</span>
                <a class="edit" title="Edit" data-toggle="tooltip">
                    <i class="fa fa-pencil"></i>
                </a>`;
            
            th.style.position = "relative";
            headerRow.appendChild(th);
        }
    }
    thead.appendChild(headerRow);

    // Create a row for dynamic input type selection
    const tbody = document.getElementById(`${tableName}-tbody`);
    const dataRow = document.createElement("tr");

    for (let i = 0; i < count; i++) {
        const inputTypeCell = document.createElement("td");
        const inputTypeSelector = document.createElement("select");
        inputTypeSelector.className = "form-control input-type-selector";
        
        // Populate the dropdown with options
        const options = ["Select", "Textbox", "Textarea", "Date", "Dropdown"];
        options.forEach(option => {
            const opt = document.createElement("option");
            opt.value = option.toLowerCase();
            opt.textContent = option;
            inputTypeSelector.appendChild(opt);
        });

        // Event listener to store the selected input type
        inputTypeSelector.addEventListener('change', function () {
            rowData[`Column${i + 1}`] = this.value;
        });
        
        inputTypeCell.appendChild(inputTypeSelector);
        dataRow.appendChild(inputTypeCell);
    }

    tbody.appendChild(dataRow);

    // Add submit and reset buttons
    const buttonsDiv = document.createElement('div');
    buttonsDiv.className = "submit-table mt-3";
    buttonsDiv.innerHTML = `
        <button type="submit" class="btn btn-primary" id="save-table">Save</button>
        <button type="reset" class="btn btn-warning" id="reset-table">Reset</button>
        <button class="btn btn-info back-btn">Back</button>
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
        tableData.push({ tableName, rowData });
        console.log('Table Data:', tableData); // Displaying the data for debugging
        
        // Display submitted table data (optional)
        displaySubmittedTableData();
    });
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



document.addEventListener('click', function (event) {
    const columns = []
    if (event.target && event.target.id === 'save-table') {
        document.querySelectorAll('.editable-column').forEach(ele=>{
            columns.push(ele.innerText)
        })
        tableData.push({columns})
        console.log('rev data', tableData);
        fetch('/submit-table-data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ tableData: tableData })
        })
        .then(response => {
            if (response.ok) {
                // Handle success if needed (optional)
                console.log('Successfully submitted data');
                window.location.href = '/due-deligence';

            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }
});


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
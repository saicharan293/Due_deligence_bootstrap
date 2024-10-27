function tableCreation(screenName, count,deptid) {
    const tablesContainer = document.querySelector('.infra-table'); // Infra-table as the container

    // Create a card structure similar to the reference template
    const newSection = document.createElement("div");
    newSection.classList.add("col-xl-12", screenName);
    
    newSection.innerHTML = 
        `<div class="card mt-3">
            <div class="card-header">
                <h5>${screenName}</h5>
            </div>
            <div class="card-body table-border-style">
                <div class="table-responsive">
                    <table class="table table-striped" id="${screenName}">
                        <thead>
                            <tr id="${screenName}-thead">
                            </tr>
                        </thead>
                        <tbody id="${screenName}-tbody">
                        </tbody>
                    </table>
                </div>
            </div>
        </div>`
    ;

    // Add the card to the container
    tablesContainer.appendChild(newSection);

    // Create the table header
    // const tableheader = document
    const headerRow = document.getElementById(`${screenName}-thead`);
    const rowData = {};

    // Create columns with editable feature
    if (count > 0) {
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
    // thead.appendChild(headerRow);

    // Create a row for dynamic input type selection
    const tbody = document.getElementById(`${screenName}-tbody`);
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
        <button type="submit" class="btn btn-primary" id="save-table" >Save</button>
        <button type="reset" class="btn btn-warning" id="reset-table">Reset</button>
        <button class="btn btn-info back-btn">Back</button>`
    ;
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
        saveTable(screenName,rowData,deptid)
        submitbtn.classList.add('disabled');
        submitbtn.disabled = true;
    });
}


// Admin Programs & Resources Management
console.log('🚀 Admin Programs & Resources script loaded');

// Switch between tabs
window.switchTab = function(tab) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => content.style.display = 'none');
    document.getElementById(`${tab}-tab`).style.display = 'block';

    // Load data for the selected tab
    if (tab === 'programs') {
        loadPrograms();
    } else if (tab === 'resources') {
        loadResources();
    }
}

// ============= PROGRAMS =============

// Load all programs
async function loadPrograms() {
    const programsList = document.getElementById('programs-list');
    const programs = dataManager.getPrograms();

    if (programs.length === 0) {
        programsList.innerHTML = '<div class="empty-state"><p>No programs added yet</p></div>';
        return;
    }

    programsList.innerHTML = programs.map(program => `
        <div class="resource-item">
            <div class="resource-info">
                <h4>${program.icon || '📚'} ${program.name}</h4>
                <p>${program.description}</p>
                <small style="color: #3b82f6;">
                    ${program.duration ? `Duration: ${program.duration}` : ''}
                    ${program.target ? `| Target: ${program.target}` : ''}
                </small>
                <div style="margin-top: 5px;">
                    <span class="badge ${program.active ? 'badge-success' : 'badge-danger'}">
                        ${program.active ? 'Active' : 'Inactive'}
                    </span>
                </div>
            </div>
            <div class="resource-actions">
                <button class="btn btn-sm btn-outline" onclick="editProgram('${program.id}')">
                    Edit
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteProgram('${program.id}', '${program.name.replace(/'/g, "\\'")}')">
                    Delete
                </button>
            </div>
        </div>
    `).join('');
}

// Show add program modal
window.showAddProgramModal = function() {
    document.getElementById('program-modal-title').textContent = 'Add Program';
    document.getElementById('program-form').reset();
    document.getElementById('program-id').value = '';
    document.getElementById('program-active').checked = true;
    document.getElementById('program-modal').style.display = 'flex';
}

// Close program modal
window.closeProgramModal = function() {
    document.getElementById('program-modal').style.display = 'none';
}

// Edit program
window.editProgram = async function(programId) {
    const program = dataManager.getProgramById(programId);
    if (!program) {
        alert('Program not found');
        return;
    }

    document.getElementById('program-modal-title').textContent = 'Edit Program';
    document.getElementById('program-id').value = program.id;
    document.getElementById('program-name').value = program.name;
    document.getElementById('program-description').value = program.description;
    document.getElementById('program-icon').value = program.icon || '';
    document.getElementById('program-duration').value = program.duration || '';
    document.getElementById('program-target').value = program.target || '';
    document.getElementById('program-active').checked = program.active !== false;

    document.getElementById('program-modal').style.display = 'flex';
}

// Delete program
window.deleteProgram = async function(programId, programName) {
    if (!confirm(`Are you sure you want to delete "${programName}"?`)) {
        return;
    }

    const success = await dataManager.deleteProgram(programId);
    if (success) {
        alert('Program deleted successfully');
        loadPrograms();
    } else {
        alert('Failed to delete program');
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ Admin Programs & Resources initialized');

    // Load programs by default
    loadPrograms();

    // Handle program form submission
    const programForm = document.getElementById('program-form');
    if (programForm) {
        programForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const programId = document.getElementById('program-id').value;
            const programData = {
                name: document.getElementById('program-name').value,
                description: document.getElementById('program-description').value,
                icon: document.getElementById('program-icon').value,
                duration: document.getElementById('program-duration').value,
                target: document.getElementById('program-target').value,
                active: document.getElementById('program-active').checked,
                updatedAt: Date.now()
            };

            let success;
            if (programId) {
                // Update existing program
                success = await dataManager.updateProgram(programId, programData);
            } else {
                // Add new program
                programData.createdAt = Date.now();
                success = await dataManager.addProgram(programData);
            }

            if (success) {
                alert(programId ? 'Program updated successfully' : 'Program added successfully');
                closeProgramModal();
                loadPrograms();
            } else {
                alert('Failed to save program');
            }
        });
    }

    // Handle resource form submission
    const resourceForm = document.getElementById('resource-form');
    if (resourceForm) {
        resourceForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const resourceId = document.getElementById('resource-id').value;
            const resourceData = {
                title: document.getElementById('resource-title').value,
                description: document.getElementById('resource-description').value,
                type: document.getElementById('resource-type').value,
                category: document.getElementById('resource-category').value,
                url: document.getElementById('resource-url').value,
                size: document.getElementById('resource-size').value,
                active: document.getElementById('resource-active').checked,
                updatedAt: Date.now()
            };

            let success;
            if (resourceId) {
                // Update existing resource
                success = await dataManager.updateResource(resourceId, resourceData);
            } else {
                // Add new resource
                resourceData.createdAt = Date.now();
                success = await dataManager.addResource(resourceData);
            }

            if (success) {
                alert(resourceId ? 'Resource updated successfully' : 'Resource added successfully');
                closeResourceModal();
                loadResources();
            } else {
                alert('Failed to save resource');
            }
        });
    }

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
});

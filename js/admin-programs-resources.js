// Admin Programs & Resources Management
console.log('🚀 Admin Programs & Resources script loaded');

// Switch between tabs
function switchTab(tab) {
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
    const programs = await dataManager.getPrograms();

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
                <button class="btn btn-sm btn-danger" onclick="deleteProgram('${program.id}', '${program.name}')">
                    Delete
                </button>
            </div>
        </div>
    `).join('');
}

// Show add program modal
function showAddProgramModal() {
    document.getElementById('program-modal-title').textContent = 'Add Program';
    document.getElementById('program-form').reset();
    document.getElementById('program-id').value = '';
    document.getElementById('program-active').checked = true;
    document.getElementById('program-modal').style.display = 'flex';
}

// Close program modal
function closeProgramModal() {
    document.getElementById('program-modal').style.display = 'none';
}

// Edit program
async function editProgram(programId) {
    const program = await dataManager.getProgramById(programId);
    if (!program) {
        utils.showNotification('Program not found', 'error');
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
async function deleteProgram(programId, programName) {
    if (!confirm(`Are you sure you want to delete "${programName}"?`)) {
        return;
    }

    const success = await dataManager.deleteProgram(programId);
    if (success) {
        utils.showNotification('Program deleted successfully', 'success');
        loadPrograms();
    } else {
        utils.showNotification('Failed to delete program', 'error');
    }
}

// Handle program form submission
document.getElementById('program-form').addEventListener('submit', async (e) => {
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
        utils.showNotification(
            programId ? 'Program updated successfully' : 'Program added successfully',
            'success'
        );
        closeProgramModal();
        loadPrograms();
    } else {
        utils.showNotification('Failed to save program', 'error');
    }
});

// ============= RESOURCES =============

// Load all resources
async function loadResources() {
    const resourcesList = document.getElementById('resources-list');
    const resources = await dataManager.getResources();

    if (resources.length === 0) {
        resourcesList.innerHTML = '<div class="empty-state"><p>No resources added yet</p></div>';
        return;
    }

    resourcesList.innerHTML = resources.map(resource => `
        <div class="resource-item">
            <div class="resource-info">
                <h4>📄 ${resource.title}</h4>
                <p>${resource.description}</p>
                <small style="color: #3b82f6;">
                    Type: ${resource.type}
                    ${resource.category ? `| Category: ${resource.category}` : ''}
                    ${resource.size ? `| Size: ${resource.size}` : ''}
                </small>
                <div style="margin-top: 5px;">
                    <span class="badge ${resource.active ? 'badge-success' : 'badge-danger'}">
                        ${resource.active ? 'Active' : 'Inactive'}
                    </span>
                </div>
            </div>
            <div class="resource-actions">
                <a href="${resource.url}" target="_blank" class="btn btn-sm btn-outline">
                    View
                </a>
                <button class="btn btn-sm btn-outline" onclick="editResource('${resource.id}')">
                    Edit
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteResource('${resource.id}', '${resource.title}')">
                    Delete
                </button>
            </div>
        </div>
    `).join('');
}

// Show add resource modal
function showAddResourceModal() {
    document.getElementById('resource-modal-title').textContent = 'Add Resource';
    document.getElementById('resource-form').reset();
    document.getElementById('resource-id').value = '';
    document.getElementById('resource-active').checked = true;
    document.getElementById('resource-modal').style.display = 'flex';
}

// Close resource modal
function closeResourceModal() {
    document.getElementById('resource-modal').style.display = 'none';
}

// Edit resource
async function editResource(resourceId) {
    const resource = await dataManager.getResourceById(resourceId);
    if (!resource) {
        utils.showNotification('Resource not found', 'error');
        return;
    }

    document.getElementById('resource-modal-title').textContent = 'Edit Resource';
    document.getElementById('resource-id').value = resource.id;
    document.getElementById('resource-title').value = resource.title;
    document.getElementById('resource-description').value = resource.description;
    document.getElementById('resource-type').value = resource.type;
    document.getElementById('resource-category').value = resource.category || '';
    document.getElementById('resource-url').value = resource.url;
    document.getElementById('resource-size').value = resource.size || '';
    document.getElementById('resource-active').checked = resource.active !== false;

    document.getElementById('resource-modal').style.display = 'flex';
}

// Delete resource
async function deleteResource(resourceId, resourceTitle) {
    if (!confirm(`Are you sure you want to delete "${resourceTitle}"?`)) {
        return;
    }

    const success = await dataManager.deleteResource(resourceId);
    if (success) {
        utils.showNotification('Resource deleted successfully', 'success');
        loadResources();
    } else {
        utils.showNotification('Failed to delete resource', 'error');
    }
}

// Handle resource form submission
document.getElementById('resource-form').addEventListener('submit', async (e) => {
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
        utils.showNotification(
            resourceId ? 'Resource updated successfully' : 'Resource added successfully',
            'success'
        );
        closeResourceModal();
        loadResources();
    } else {
        utils.showNotification('Failed to save resource', 'error');
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ Admin Programs & Resources initialized');

    // Wait for Firebase to be ready
    window.addEventListener('firebaseReady', () => {
        loadPrograms();
    });

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
});

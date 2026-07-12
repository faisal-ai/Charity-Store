// Admin Programs & Resources Management — Firebase-backed
console.log('🚀 Admin Programs & Resources script loaded');

// Helper: get firebaseDataManager when ready
function getFB() { return window._fbDM || null; }

// ── Tab switching ──────────────────────────────────────────────────────────

window.switchTab = function(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');
    document.getElementById(`${tab}-tab`).style.display = 'block';
    if (tab === 'programs') loadPrograms();
    else loadResources();
};

// ── PROGRAMS ──────────────────────────────────────────────────────────────

async function loadPrograms() {
    const list = document.getElementById('programs-list');
    list.innerHTML = '<p style="padding:20px;color:#64748b;">Loading...</p>';

    let programs = [];
    const fb = getFB();
    if (fb) {
        programs = await fb.getPrograms();
    } else {
        programs = dataManager.getPrograms() || [];
    }

    if (!programs.length) {
        list.innerHTML = '<div class="empty-state"><p>No programs yet. Click "Add Program" to create one.</p></div>';
        return;
    }

    list.innerHTML = programs.map(p => `
        <div class="resource-item">
            <div class="resource-info">
                <h4>${p.icon || '📚'} ${p.name}</h4>
                <p>${p.description || ''}</p>
                <small style="color:#3b82f6;">
                    ${p.duration ? `Duration: ${p.duration}` : ''}
                    ${p.target ? `| Target: ${p.target}` : ''}
                </small>
                <div style="margin-top:5px;">
                    <span class="badge ${p.active ? 'badge-success' : 'badge-danger'}">${p.active ? 'Active' : 'Inactive'}</span>
                </div>
            </div>
            <div class="resource-actions">
                <button class="btn btn-sm btn-outline" onclick="editProgram('${p.id}')">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deleteProgram('${p.id}', '${(p.name || '').replace(/'/g, "\\'")}')">Delete</button>
            </div>
        </div>`).join('');
}

window.showAddProgramModal = function() {
    document.getElementById('program-modal-title').textContent = 'Add Program';
    document.getElementById('program-form').reset();
    document.getElementById('program-id').value = '';
    document.getElementById('program-active').checked = true;
    document.getElementById('program-modal').style.display = 'flex';
};

window.closeProgramModal = function() {
    document.getElementById('program-modal').style.display = 'none';
};

window.editProgram = async function(programId) {
    const fb = getFB();
    let program = null;
    if (fb) {
        const all = await fb.getPrograms();
        program = all.find(p => p.id === programId);
    } else {
        program = dataManager.getProgramById(programId);
    }
    if (!program) { alert('Program not found'); return; }

    document.getElementById('program-modal-title').textContent = 'Edit Program';
    document.getElementById('program-id').value = program.id;
    document.getElementById('program-name').value = program.name || '';
    document.getElementById('program-description').value = program.description || '';
    document.getElementById('program-icon').value = program.icon || '';
    document.getElementById('program-duration').value = program.duration || '';
    document.getElementById('program-target').value = program.target || '';
    document.getElementById('program-active').checked = program.active !== false;
    document.getElementById('program-modal').style.display = 'flex';
};

window.deleteProgram = async function(programId, programName) {
    if (!confirm(`Delete "${programName}"? This cannot be undone.`)) return;
    const fb = getFB();
    let ok = fb ? await fb.deleteProgram(programId) : await dataManager.deleteProgram(programId);
    if (ok) { utils.showNotification('Program deleted', 'success'); loadPrograms(); }
    else utils.showNotification('Failed to delete program', 'error');
};

// ── RESOURCES ─────────────────────────────────────────────────────────────

async function loadResources() {
    const list = document.getElementById('resources-list');
    list.innerHTML = '<p style="padding:20px;color:#64748b;">Loading...</p>';

    let resources = [];
    const fb = getFB();
    if (fb) {
        resources = await fb.getResources();
    } else {
        resources = dataManager.getResources() || [];
    }

    if (!resources.length) {
        list.innerHTML = '<div class="empty-state"><p>No resources yet. Click "Add Resource" to upload one.</p></div>';
        return;
    }

    list.innerHTML = resources.map(r => `
        <div class="resource-item">
            <div class="resource-info">
                <h4>📄 ${r.title}</h4>
                <p>${r.description || ''}</p>
                <small style="color:#3b82f6;">
                    Type: ${r.type}
                    ${r.category ? `| Category: ${r.category}` : ''}
                    ${r.size ? `| Size: ${r.size}` : ''}
                </small>
                <div style="margin-top:5px;">
                    <span class="badge ${r.active ? 'badge-success' : 'badge-danger'}">${r.active ? 'Active' : 'Inactive'}</span>
                </div>
            </div>
            <div class="resource-actions">
                ${r.url ? `<a href="${r.url}" target="_blank" class="btn btn-sm btn-outline">View</a>` : ''}
                <button class="btn btn-sm btn-outline" onclick="editResource('${r.id}')">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deleteResource('${r.id}', '${(r.title || '').replace(/'/g, "\\'")}')">Delete</button>
            </div>
        </div>`).join('');
}

window.showAddResourceModal = function() {
    document.getElementById('resource-modal-title').textContent = 'Add Resource';
    document.getElementById('resource-form').reset();
    document.getElementById('resource-id').value = '';
    document.getElementById('resource-active').checked = true;
    // Show/hide URL vs file input based on type
    toggleResourceInput();
    document.getElementById('resource-modal').style.display = 'flex';
};

window.closeResourceModal = function() {
    document.getElementById('resource-modal').style.display = 'none';
};

window.toggleResourceInput = function() {
    const fileGroup = document.getElementById('resource-file-group');
    const urlGroup  = document.getElementById('resource-url-group');
    const type = document.getElementById('resource-type') && document.getElementById('resource-type').value;
    const isUploadable = ['PDF','DOC','PPT'].includes(type);
    if (fileGroup) fileGroup.style.display = isUploadable ? 'block' : 'none';
    if (urlGroup)  urlGroup.style.display  = isUploadable ? 'none'  : 'block';
};

window.editResource = async function(resourceId) {
    const fb = getFB();
    let resource = null;
    if (fb) {
        const all = await fb.getResources();
        resource = all.find(r => r.id === resourceId);
    } else {
        resource = dataManager.getResourceById(resourceId);
    }
    if (!resource) { alert('Resource not found'); return; }

    document.getElementById('resource-modal-title').textContent = 'Edit Resource';
    document.getElementById('resource-id').value = resource.id;
    document.getElementById('resource-title').value = resource.title || '';
    document.getElementById('resource-description').value = resource.description || '';
    document.getElementById('resource-type').value = resource.type || '';
    document.getElementById('resource-category').value = resource.category || '';
    document.getElementById('resource-url').value = resource.url || '';
    document.getElementById('resource-size').value = resource.size || '';
    document.getElementById('resource-active').checked = resource.active !== false;
    toggleResourceInput();
    document.getElementById('resource-modal').style.display = 'flex';
};

window.deleteResource = async function(resourceId, resourceTitle) {
    if (!confirm(`Delete "${resourceTitle}"?`)) return;
    const fb = getFB();
    let ok = fb ? await fb.deleteResource(resourceId) : await dataManager.deleteResource(resourceId);
    if (ok) { utils.showNotification('Resource deleted', 'success'); loadResources(); }
    else utils.showNotification('Failed to delete resource', 'error');
};

// ── Init & form handlers ───────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    loadPrograms();

    // Program form
    document.getElementById('program-form').addEventListener('submit', async e => {
        e.preventDefault();
        const programId = document.getElementById('program-id').value;
        const data = {
            name:        document.getElementById('program-name').value,
            description: document.getElementById('program-description').value,
            icon:        document.getElementById('program-icon').value,
            duration:    document.getElementById('program-duration').value,
            target:      document.getElementById('program-target').value,
            active:      document.getElementById('program-active').checked,
            updatedAt:   Date.now()
        };
        if (programId) data.id = programId;
        else data.createdAt = Date.now();

        const fb = getFB();
        let result;
        try {
            result = fb ? await fb.saveProgram(data) : (programId ? await dataManager.updateProgram(programId, data) : await dataManager.addProgram(data));
        } catch(err) {
            utils.showNotification('Error: ' + err.message, 'error'); return;
        }
        if (result) {
            utils.showNotification(programId ? 'Program updated!' : 'Program added!', 'success');
            closeProgramModal(); loadPrograms();
        } else {
            utils.showNotification('Failed to save program', 'error');
        }
    });

    // Resource form
    document.getElementById('resource-form').addEventListener('submit', async e => {
        e.preventDefault();
        const resourceId = document.getElementById('resource-id').value;
        const data = {
            title:       document.getElementById('resource-title').value,
            description: document.getElementById('resource-description').value,
            type:        document.getElementById('resource-type').value,
            category:    document.getElementById('resource-category').value,
            size:        document.getElementById('resource-size').value,
            active:      document.getElementById('resource-active').checked,
            updatedAt:   Date.now()
        };
        if (resourceId) data.id = resourceId;
        else data.createdAt = Date.now();

        // File upload takes priority over URL field
        const fileInput = document.getElementById('resource-file');
        const urlInput  = document.getElementById('resource-url');
        if (fileInput && fileInput.files[0]) {
            data.file = fileInput.files[0];
        } else if (urlInput) {
            data.url = urlInput.value;
        }

        const saveBtn = document.querySelector('#resource-form + div .btn-primary') || document.getElementById('resource-save-btn');
        if (saveBtn) { saveBtn.disabled = true; saveBtn.textContent = 'Saving...'; }

        const fb = getFB();
        let result;
        try {
            result = fb ? await fb.saveResource(data) : (resourceId ? await dataManager.updateResource(resourceId, data) : await dataManager.addResource(data));
        } catch(err) {
            utils.showNotification('Error: ' + err.message, 'error');
            if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = 'Save Resource'; }
            return;
        }
        if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = 'Save Resource'; }
        if (result) {
            utils.showNotification(resourceId ? 'Resource updated!' : 'Resource added!', 'success');
            closeResourceModal(); loadResources();
        } else {
            utils.showNotification('Failed to save resource', 'error');
        }
    });

    window.addEventListener('click', e => {
        if (e.target.classList.contains('modal')) e.target.style.display = 'none';
    });
});

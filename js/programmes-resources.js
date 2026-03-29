// Load Programs and Resources dynamically from dataManager
console.log('📚 Loading Programs & Resources...');

// Load Programs
function loadPrograms() {
    const container = document.getElementById('programs-container');
    if (!container) return;

    const programs = dataManager.getPrograms().filter(p => p.active !== false);

    if (programs.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center" style="padding: 40px;">
                <p style="color: #7f8c8d; font-size: 1.1rem;">No programs available at the moment. Please check back soon!</p>
            </div>
        `;
        return;
    }

    // Build programs HTML
    let html = '';
    programs.forEach((program, index) => {
        const colClass = programs.length <= 3 ? 'col-4' : 'col-6';

        html += `
            <div class="${colClass}">
                <div class="card" style="height: 100%; margin-bottom: 30px;">
                    <div class="card-body">
                        <h4 style="color: #3b82f6;">${program.icon || '📚'} ${program.name}</h4>
                        ${program.duration ? `<p><strong>Duration:</strong> ${program.duration}</p>` : ''}
                        ${program.target ? `<p><strong>Target:</strong> ${program.target}</p>` : ''}
                        <p>${program.description}</p>
                        <a href="mentoring-booking.html?program=${encodeURIComponent(program.name.toLowerCase().replace(/\s+/g, '-'))}" class="btn btn-primary">Book Session</a>
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

// Load Resources
function loadResources() {
    const container = document.getElementById('resources-container');
    if (!container) return;

    const resources = dataManager.getResources().filter(r => r.active !== false);

    if (resources.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center" style="padding: 40px;">
                <p style="color: #7f8c8d; font-size: 1.1rem;">No resources available at the moment. Please check back soon!</p>
            </div>
        `;
        return;
    }

    // Build resources HTML
    let html = '';
    resources.forEach(resource => {
        html += `
            <div class="col-6">
                <div class="card resource-card" style="margin-bottom: 30px;">
                    <div class="card-body">
                        <h4>📄 ${resource.title}</h4>
                        <p>${resource.description}</p>
                        <p><strong>Type:</strong> ${resource.type}${resource.size ? ` | <strong>Size:</strong> ${resource.size}` : ''}</p>
                        ${resource.category ? `<p><strong>Category:</strong> ${resource.category}</p>` : ''}
                        <a href="${resource.url}" target="_blank" class="download-btn">
                            <span>⬇</span> View ${resource.type}
                        </a>
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ Programs & Resources page initialized');
    loadPrograms();
    loadResources();
});

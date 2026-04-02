// Sidebar Toggle Functionality
document.addEventListener('DOMContentLoaded', function() {
    const sidebarToggle = document.getElementById('sidebarToggle');
    const body = document.body;
    const toggleIcon = document.querySelector('.toggle-icon');
    let rotation = 0; // Track rotation in degrees
    
    sidebarToggle.addEventListener('click', function() {
        body.classList.toggle('sidebar-collapsed');
        // Always rotate clockwise by 90 degrees (keep accumulating for smooth clockwise animation)
        rotation += 90;
        toggleIcon.style.transform = `rotate(${rotation}deg)`;
    });
    
    // Dark Mode Toggle Functionality
    const darkModeToggle = document.getElementById('darkModeToggle');
    const darkModeSwitch = document.querySelector('.dark-mode-switch');
    const darkModeSlider = document.querySelector('.dark-mode-slider');
    
    // Match the height of the sidebar toggle
    function syncDarkModeToggleHeight() {
        const sidebarToggle = document.getElementById('sidebarToggle');
        const sidebarHeight = sidebarToggle.offsetHeight;
        darkModeSwitch.style.height = sidebarHeight + 'px';
        darkModeSlider.style.width = sidebarHeight + 'px';
        darkModeSlider.style.height = sidebarHeight + 'px';
        // Calculate the translation distance (switch width - slider width)
        // Both have 1px borders, so we account for that
        const translation = darkModeSwitch.offsetWidth - darkModeSlider.offsetWidth;
        if (body.classList.contains('dark-mode')) {
            darkModeSlider.style.transform = `translateX(${translation}px)`;
        } else {
            darkModeSlider.style.transform = 'translateX(0)';
        }
    }
    
    // Sync height on load and resize
    syncDarkModeToggleHeight();
    window.addEventListener('resize', syncDarkModeToggleHeight);
    
    darkModeToggle.addEventListener('click', function() {
        body.classList.toggle('dark-mode');
        // Save preference to localStorage
        const isDarkMode = body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDarkMode);
        
        // Update slider position
        const translation = darkModeSwitch.offsetWidth - darkModeSlider.offsetWidth;
        if (isDarkMode) {
            darkModeSlider.style.transform = `translateX(${translation}px)`;
        } else {
            darkModeSlider.style.transform = 'translateX(0)';
        }
    });
    
    // Load dark mode preference from localStorage
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode === 'true') {
        body.classList.add('dark-mode');
        // Set initial slider position after a brief delay to ensure DOM is ready
        setTimeout(() => {
            syncDarkModeToggleHeight();
        }, 10);
    }
    
    // Handle page content loading
    const contentArea = document.getElementById('contentArea');
    
    // Article file mapping: maps project ID to article filename
    // IDs are in reverse chronological order (newest first) within each section
    const articleMapping = {
        'biology-search-engine': '2025_6.md',          // Newest 2025
        'aws-administrator': '2025_5.md',
        'sharepoint-powerbi': '2025_4.md',
        'business-intelligence-webapp': '2025_3.md',
        'internal-survey-platform': '2025_2.md',
        'alumni-outreach-platform': '2025_1.md',       // Oldest 2025
        'workato-aof': '2024_1.md',                    // 2024
        'this-website': 'HOBBIES_4.md',                // Newest Hobbies
        'zmap': 'HOBBIES_3.md',
        'voxelbulb': 'HOBBIES_2.md',
        'arena': 'HOBBIES_1.md'                        // Oldest Hobbies
    };
    
    // Configure marked.js for markdown rendering
    if (typeof marked !== 'undefined') {
        marked.setOptions({
            breaks: true, // Convert line breaks to <br>
            gfm: true, // GitHub Flavored Markdown
            headerIds: true,
            mangle: false
        });
    }
    
    // Function to load and render markdown article
    async function loadArticle(projectId) {
        const articleFile = articleMapping[projectId];
        if (!articleFile) {
            return null; // No article file mapped
        }
        
        try {
            const response = await fetch(`DIR-Articles/${articleFile}`);
            if (!response.ok) {
                // File doesn't exist, return null to use default body
                return null;
            }
            const markdown = await response.text();
            
            // Render markdown to HTML
            if (typeof marked !== 'undefined') {
                return marked.parse(markdown);
            } else {
                // Fallback if marked.js isn't loaded
                return `<pre>${markdown}</pre>`;
            }
        } catch (error) {
            console.error('Error loading article:', error);
            return null; // Return null to use default body
        }
    }
    
    // Project data
    const projects = {
        'home': {
            title: 'Welcome!',
            body: `
                <div class="home-layout">
                    <div class="home-left">
                        <img src="DIR-Resources/IMG-PFP-LinkedIn.png" alt="Aditya Gupta" class="profile-image">
                    </div>
                    <div class="home-right">
                        <h2 class="home-name">Aditya Gupta</h2>
                        <p class="home-location">RTP Area, NC</p>
                        <p class="home-email"><a href="mailto:adiguptaxd@gmail.com">adiguptaxd@gmail.com</a></p>
                        <hr class="home-divider">
                        <p class="home-bio">Hey! I'm Adi, a Software & Cloud Engineer excited about all things computing; from high-level systems architecture to low-level memory access techniques.</p>
                        <p class="home-bio">Here, you'll find professional and personal projects I've worked on. I do hope you'll discover something useful about designing end-to-end solutions!</p>
                    </div>
                </div>
            `,
            tags: [],
            isProject: false
        },
        'biology-search-engine': {
            title: "Biology's Search Engine",
            company: 'Alchemy Bio',
            tags: ['Alchemy Bio', 'OpenSearch Service', 'IAM', 'Lambda', 'DynamoDB', 'CloudFormation', 'CloudWatch', 'Health Checks', 'SES', 'Vector DB', 'Graph DB', 'Version Control', 'Git', 'GitHub'],
            body: '<p>Content coming soon...</p>',
            isProject: true,
            lastUpdated: 'N/A'
        },
        'aws-administrator': {
            title: 'AWS Administrator',
            company: 'Alchemy Bio',
            tags: ['Alchemy Bio', 'AWS', 'IAM', 'Secrets Manager', 'EC2', 'ECS', 'ECR', 'EKS', 'Fargate', 'S3', 'DynamoDB', 'VPC', 'Route 53', 'CloudFront', 'API Gateway', 'ALB', 'Load Balancing', 'CDK', 'CloudFormation', 'CloudWatch', 'Health Checks', 'SES'],
            body: '<p>Content coming soon...</p>',
            isProject: true,
            lastUpdated: 'N/A'
        },
        'sharepoint-powerbi': {
            title: 'SharePoint & Power BI Administrator',
            company: 'DynPro Inc.',
            tags: ['DynPro Inc.', 'MS SharePoint', 'MS Power Platform', 'MS Power Automate', 'MS Power BI', 'PaaS', 'Data Integration', 'Data Automation'],
            body: '<p>Content coming soon...</p>',
            isProject: true,
            lastUpdated: '2025-11-23'
        },
        'business-intelligence-webapp': {
            title: 'Business Intelligence Web App',
            company: 'DynPro Inc.',
            tags: ['DynPro Inc.', 'Azure', 'React', 'Vite', 'Express', 'PostgreSQL', 'SQL', 'NGINX', 'PM2', 'Docker', 'Docker Compose', 'systemd', 'DNS Configuration', 'Domain Management', 'SSL/TLS Certificates', 'HTTPS Configuration', 'Port Management', 'Linux Administration', 'Package Management', 'Apache', 'Bash', 'Node.js', 'RDBMS', 'Databases', 'Connection Pooling', 'SSH', 'Build Tools', 'RESTful APIs', 'SFTP', 'Version Control', 'Git', 'GitHub'],
            body: '<p>Content coming soon...</p>',
            isProject: true,
            lastUpdated: 'N/A'
        },
        'internal-survey-platform': {
            title: 'Internal Survey Platform',
            company: 'DynPro Inc.',
            tags: ['DynPro Inc.', 'Azure', 'React', 'Vite', 'Express', 'PostgreSQL', 'SQL', 'NGINX', 'PM2', 'systemd', 'DNS Configuration', 'Domain Management', 'SSL/TLS Certificates', 'HTTPS Configuration', 'Port Management', 'Linux Administration', 'Package Management', 'Apache', 'Bash', 'Node.js', 'RDBMS', 'Databases', 'Connection Pooling', 'SSH', 'Build Tools', 'RESTful APIs', 'SFTP', 'Version Control', 'Git', 'GitHub'],
            body: '<p>Content coming soon...</p>',
            isProject: true,
            lastUpdated: 'N/A'
        },
        'alumni-outreach-platform': {
            title: 'Alumni Outreach Platform',
            company: 'DynPro Inc.',
            tags: ['DynPro Inc.', 'React', 'Vite', 'Express', 'MongoDB', 'NoSQL', 'Web Scraping', 'NGINX', 'PM2', 'systemd', 'DNS Configuration', 'Domain Management', 'SSL/TLS Certificates', 'HTTPS Configuration', 'Port Management', 'Linux Administration', 'Package Management', 'Apache', 'Bash', 'Node.js', 'RDBMS', 'Databases', 'Connection Pooling', 'SSH', 'Build Tools', 'RESTful APIs', 'SFTP', 'Version Control', 'Git', 'GitHub'],
            body: '<p>Content coming soon...</p>',
            isProject: true,
            lastUpdated: '2025-11-23'
        },
        'workato-aof': {
            title: 'Workato: Autonomous Operations Framework',
            company: 'DynPro Inc.',
            tags: ['DynPro Inc.', 'Workato', 'PaaS', 'Data Integration', 'Data Automation'],
            body: '<p>Content coming soon...</p>',
            isProject: true,
            lastUpdated: '2025-11-22'
        },
        'this-website': {
            title: 'This Website: The Joy of UI/UX Design',
            company: 'Personal',
            tags: ['Personal', 'UI/UX Design', 'HTML', 'CSS', 'JavaScript', 'Markdown', 'GitHub Pages', 'Marked.js', 'Version Control', 'Git', 'GitHub'],
            body: '<p>Content coming soon...</p>',
            isProject: true,
            lastUpdated: '2025-11-21'
        },
        'zmap': {
            title: 'zmap: Sharing a 2D Map with Theoretically Infinite Computing Power',
            company: 'Personal',
            tags: ['Personal', 'SFML', 'Mandelbrot Set', 'Fractals', 'Version Control', 'Git', 'GitHub'],
            body: '<p>Content coming soon...</p>',
            isProject: true,
            lastUpdated: '2025-11-21'
        },
        'voxelbulb': {
            title: 'Voxelbulb: A 3D Fractal Simulation Engine (Post-Processing Shaders Included)',
            company: 'Personal',
            tags: ['Personal', 'OpenGL', 'MVP Matrix', 'GLSL', 'Pre-Processing Shaders', 'Post-Processing Shaders', 'FBO', 'VAO', 'VBO', 'EBO', 'Texture Sampling', 'Depth Testing', 'Perspective Projection', 'Camera Controls', 'Matrix Transformations', 'Vector Math', 'Euler Angles', 'Spherical Coordinates', 'Mandelbulb Set', 'Mandelbrot Set', 'Fractals', 'Rendering', 'Multithreading', 'Multiprocessing', 'Shared Memory', 'Physics Simulation', 'Collision Detection', 'Pygame', 'NumPy', 'OpenCV', 'Modular Design', 'LOD', 'Memory Management', 'Lighting Models', 'Color Interpolation', 'Edge Detection', 'Dithering', 'Face Culling', 'Version Control', 'Git', 'GitHub'],
            body: '<p>Content coming soon...</p>',
            isProject: true,
            lastUpdated: '2025-11-21'
        },
        'arena': {
            title: 'Arena: My Take on a Competitive, Multiplayer FPS Game',
            company: 'Personal',
            tags: ['Personal', 'Unity Engine', 'Unity Scripting', 'Unity Package Manager', 'C#', 'Mirror Networking', 'Network Architecture', 'RPCs', 'SyncVars', 'Network Manager', 'Network Optimization', 'Network HUD', 'Client-Server Model', 'Interpolation', 'Camera Controls', 'Physics Simulation', 'Collision Detection', 'Game Design', 'Map Design', 'UI/UX Design', 'Serialization', 'State Machines', 'Asset Management', 'Version Control', 'Git', 'GitHub', 'Visual Studio'],
            body: '<p>Content coming soon...</p>',
            isProject: true,
            lastUpdated: '2025-11-21'
        }
    };
    
    async function loadPage(page) {
        console.log('Loading page:', page); // Debug
        const project = projects[page];
        if (!project) return;
        
        if (project.isProject) {
            // Build tags HTML
            let companyClass = 'alchemy';
            if (project.company === 'DynPro Inc.') {
                companyClass = 'dynpro';
            } else if (project.company === 'Personal') {
                companyClass = 'personal';
            }
            const companyTag = project.tags[0];
            const skillTags = project.tags.slice(1).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
            
            let tagsHTML = `<div class="project-tags">`;
            
            // Company tag (first)
            if (companyTag) {
                tagsHTML += `<span class="tag-pill company ${companyClass}">${companyTag}</span>`;
            }
            
            // Skill tags container (collapsible)
            if (skillTags.length > 0) {
                tagsHTML += `<div class="skill-tags-container">`;
                skillTags.forEach(tag => {
                    tagsHTML += `<span class="tag-pill skill">${tag}</span>`;
                });
                tagsHTML += `</div>`;
                tagsHTML += `<button class="skill-tags-toggle" aria-label="Toggle skill tags">
                    <span class="skill-tags-toggle-text">Collapse</span>
                    <span class="skill-tags-arrow">▼</span>
                </button>`;
            }
            
            tagsHTML += `</div>`;
            
            // Format last updated date
            const date = new Date(project.lastUpdated);
            const formattedDate = date.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
            
            // Try to load article content, fallback to default body
            const articleContent = await loadArticle(page);
            const bodyContent = articleContent !== null ? articleContent : project.body;
            
            contentArea.innerHTML = `
                <h1 class="project-title">${project.title}</h1>
                ${tagsHTML}
                <hr class="project-divider">
                <div class="project-body">
                    ${bodyContent}
                </div>
                <hr class="project-divider">
                <div class="project-timestamp">Last updated: ${formattedDate}</div>
            `;
            
            // Set up skill tags toggle functionality
            if (skillTags.length > 0) {
                const toggleBtn = contentArea.querySelector('.skill-tags-toggle');
                const skillTagsContainer = contentArea.querySelector('.skill-tags-container');
                
                if (toggleBtn && skillTagsContainer) {
                    toggleBtn.addEventListener('click', function() {
                        skillTagsContainer.classList.toggle('collapsed');
                        const isCollapsed = skillTagsContainer.classList.contains('collapsed');
                        const toggleText = toggleBtn.querySelector('.skill-tags-toggle-text');
                        toggleText.textContent = isCollapsed ? 'Expand' : 'Collapse';
                    });
                }
            }
        } else {
            // Home page or non-project pages
            contentArea.innerHTML = project.body;
        }
    }
    
    // Default to home page
    loadPage('home');
    
    // Handle section header clicks (collapse/expand)
    const sectionHeaders = document.querySelectorAll('.section-header');
    sectionHeaders.forEach(header => {
        header.addEventListener('click', function(e) {
            // Don't toggle if clicking on the arrow itself (it's already handled)
            const section = this.closest('.sidebar-section');
            if (section) {
                section.classList.toggle('collapsed');
            }
        });
    });
    
    // Handle subsection clicks
    const subsectionLinks = document.querySelectorAll('.subsection-link');
    subsectionLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.getAttribute('data-page');
            console.log('Link clicked, page:', page); // Debug
            loadPage(page);
            
            // Update active state
            subsectionLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Handle all links: mailto opens mail client, hash links navigate internally, others open in new tab
    document.addEventListener('click', function(e) {
        const link = e.target.closest('a');
        if (link && link.href) {
            // Skip if it's a subsection link (handled separately)
            if (link.classList.contains('subsection-link') || link.classList.contains('social-icon')) {
                return;
            }
            
            // If it's a mailto link, let it open normally
            if (link.href.startsWith('mailto:')) {
                return; // Let browser handle mailto links
            }
            
            // Handle internal navigation links (hash links like #page-id)
            const url = new URL(link.href, window.location.href);
            if (url.hash && url.hash.startsWith('#')) {
                const pageId = url.hash.substring(1); // Remove the #
                // Check if this page exists in the projects object
                if (projects[pageId]) {
                    e.preventDefault();
                    loadPage(pageId);
                    // Update active state in sidebar
                    const subsectionLinks = document.querySelectorAll('.subsection-link');
                    subsectionLinks.forEach(l => l.classList.remove('active'));
                    const activeLink = document.querySelector(`.subsection-link[data-page="${pageId}"]`);
                    if (activeLink) {
                        activeLink.classList.add('active');
                    }
                    return;
                }
            }
            
            // For all other links, open in new tab
            e.preventDefault();
            window.open(link.href, '_blank', 'noopener,noreferrer');
        }
    });
});

// Semester tab switching logic
const semesterTabs = document.querySelectorAll('.semester-tab');
const semesterPanels = document.querySelectorAll('.semester-panel');

semesterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        semesterTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        semesterPanels.forEach(p => p.classList.add('hidden'));
        const semester = tab.getAttribute('data-semester');
        document.getElementById('semester-' + semester).classList.remove('hidden');
    });
});

// Sample placeholder topics for each course
// Keys are "semester-classcode" e.g. "1-205"
const courseTopics = {};

// Helper to generate placeholder topics for any course code
function getTopicsForCourse(semesterClass) {
    const key = semesterClass.replace(' ', '-');
    if (!courseTopics[key]) {
        // Generate 5 generic placeholder topics
        courseTopics[key] = [
            'Topic 1: Introduction',
            'Topic 2: Core Concepts',
            'Topic 3: Key Formulas',
            'Topic 4: Examples',
            'Topic 5: Review'
        ];
    }
    return courseTopics[key];
}

// Subfolder tab switching logic
const subfolderTabs = document.querySelectorAll('.subfolder-tab');

subfolderTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        // Get the parent semester panel
        const panel = tab.closest('.semester-panel');
        // Deactivate all subfolder tabs in this panel
        panel.querySelectorAll('.subfolder-tab').forEach(t => t.classList.remove('active'));
        // Activate clicked tab
        tab.classList.add('active');

        // Get semester info
        const semesterClass = tab.getAttribute('data-semester-class');
        const semester = semesterClass.split(' ')[0];
        const courseCode = semesterClass.split(' ')[1];

        // Populate the topic list sidebar
        const topicList = document.getElementById('topic-list-' + semester);
        const topics = getTopicsForCourse(semesterClass);
        topicList.innerHTML = '';
        topics.forEach((topic, index) => {
            const topicEl = document.createElement('div');
            topicEl.className = 'topic-item' + (index === 0 ? ' active' : '');
            topicEl.textContent = topic;
            topicEl.dataset.topicIndex = index;
            topicEl.addEventListener('click', () => {
                // Deactivate all topic items in this list
                topicList.querySelectorAll('.topic-item').forEach(t => t.classList.remove('active'));
                // Activate clicked topic
                topicEl.classList.add('active');
                // Load the topic module content
                loadTopicContent(semester, courseCode, topic, index);
            });
            topicList.appendChild(topicEl);
        });

        // Load the first topic by default
        const paperMain = document.getElementById('paper-main-' + semester);
        const defaultTopic = topics[0];
        paperMain.innerHTML = '<div class="placeholder-note">📖 <strong>' + tab.textContent + '</strong> — ' + defaultTopic + '<br><br><em>Topic content will appear here.</em></div>';
    });
});

// Load topic content into the paper-main area
function loadTopicContent(semester, courseCode, topicName, topicIndex) {
    const paperMain = document.getElementById('paper-main-' + semester);
    paperMain.innerHTML = '<div class="placeholder-note">📖 <strong>Course ' + courseCode + '</strong> — ' + topicName + '<br><br><em>Module content for ' + topicName + ' will be displayed here.</em></div>';
}
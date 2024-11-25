document.addEventListener('DOMContentLoaded', () => {
    // Инициализация компонентов
    initializeNavigation();
});

function initializeNavigation() {
    const navLinks = document.querySelectorAll('.sidebar-nav a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Удаляем активный класс у всех ссылок
            navLinks.forEach(l => l.classList.remove('active'));
            
            // Добавляем активный класс к нажатой ссылке
            link.classList.add('active');
            
            // Здесь будет логика навигации по разделам
            const section = link.getAttribute('href').substring(1);
            loadSection(section);
        });
    });
}

function loadSection(section) {
    // В будущем здесь будет логика загрузки различных разделов
    console.log(`Загрузка раздела: ${section}`);
}

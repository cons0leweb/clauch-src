document.addEventListener('DOMContentLoaded', () => {
    const snowContainer = document.getElementById('snowContainer');


    const snowflakeCount = 100; 
    const snowflakeInterval = 100; 
    const snowflakeLifetime = 5000;

    function createSnowflake() {
        if (snowContainer.childElementCount >= snowflakeCount) return;

        const snowflake = document.createElement('div');
        snowflake.classList.add('snowflake');
        snowflake.style.left = `${Math.random() * 100}vw`;
        snowflake.style.animationDuration = `${Math.random() * 3 + 2}s`;
        snowflake.style.opacity = Math.random() * 0.8 + 0.2; 
        snowflake.style.fontSize = `${Math.random() * 10 + 10}px`; 
        snowflake.textContent = ' dev@v0.0.6 ';
        snowContainer.appendChild(snowflake);

        setTimeout(() => {
            snowflake.remove();
        }, snowflakeLifetime);
    }

    setInterval(createSnowflake, snowflakeInterval);
});
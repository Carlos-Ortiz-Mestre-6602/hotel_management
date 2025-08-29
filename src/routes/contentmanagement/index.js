const contentManagementRoute = {
    setup: () => {

        const navButtons = document.querySelectorAll('.contentManagementNavButton');

        navButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                const pageName = event.currentTarget.dataset.pageName;
                navigate("contentManagementContent", pageName);
            });
        });

    }
}

export default contentManagementRoute;
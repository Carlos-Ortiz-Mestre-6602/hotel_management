const contentManagementRoute = {
    setup: (shadowRoot, navigate) => {

        const navButtons = shadowRoot.querySelectorAll('.contentManagementNavButton');

        console.log(navButtons);

        navButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                const pageName = event.currentTarget.dataset.pageName;
                navigate(shadowRoot, "contentManagementContent", pageName);
            });
        });

    }
}

export default contentManagementRoute;
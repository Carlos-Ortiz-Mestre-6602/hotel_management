const contentManagementRoute = {
    setup: (shadowRoot, navigate) => {

        const navButtons = shadowRoot.querySelectorAll('.contentManagementNavButton');

        navButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                const pageName = event.currentTarget.dataset.pageName;
                navigate(shadowRoot, "contentManagementContent", pageName);
            });
        });

        // Default page
        navigate(shadowRoot, "contentManagementContent", "booking");

    }
}

export default contentManagementRoute;
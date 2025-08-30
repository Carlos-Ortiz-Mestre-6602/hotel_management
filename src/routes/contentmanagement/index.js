const contentManagementRoute = {
    setup: (shadowRoot, utils) => {

        const navButtons = shadowRoot.querySelectorAll('.contentManagementNavButton');

        navButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                const pageName = event.currentTarget.dataset.pageName;
                utils.navigate(shadowRoot, "contentManagementContent", pageName);
            });
        });

        // Default page
        utils.navigate(shadowRoot, "contentManagementContent", "booking");

    }
}

export default contentManagementRoute;
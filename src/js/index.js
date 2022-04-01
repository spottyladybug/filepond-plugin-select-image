const isPreviewableImage = file => /^image/.test(file.type);

/**
 * Select Image Plugin
 */
const plugin = _ => {
    const { addFilter, utils, views } = _;
    const { Type, createRoute } = utils;
    const { fileActionButton } = views;

    // called for each view that is created right after the 'create' method
    addFilter('CREATE_VIEW', viewAPI => {
        // get reference to created view
        const { is, view, query } = viewAPI;

        const canShowImagePreview = query('GET_ALLOW_IMAGE_PREVIEW');
        const canShowSelectButton = query('GET_ALLOW_IMAGE_SELECT');
        const selectCallback = query('GET_SELECT_CALLBACK');

        if (!canShowSelectButton) return;

        // only run for either the file or the file info panel
        const shouldExtendView =
            (is('file-info') && !canShowImagePreview) ||
            (is('file') && canShowImagePreview);

        if (!shouldExtendView) return;

        /**
         * Image Preview related
         */

        // create the image select plugin, but only do so if the item is an image
        const didLoadItem = ({ root, props }) => {
            const { id } = props;

            // try to access item
            const item = query('GET_ITEM', id);
            if (!item) return;

            // get the file object
            const file = item.file;

            // exit if this is not an image
            if (!isPreviewableImage(file)) return;

            // handle interactions
            root.ref.handleSelect = e => {
                e.stopPropagation();
                selectCallback(item.serverId);
            };

            const icon = query('GET_SELECT_IMAGE_BUTTON_ICON');
            const position = query('GET_SELECT_IMAGE_BUTTON_POSITION');
        
            if (canShowImagePreview) {
                // add select button to preview
                const buttonView = view.createChildView(fileActionButton, {
                    label: 'select',
                    icon,
                    opacity: 0,
                });

                // select item classname
                buttonView.element.classList.add('filepond--action-select-item');
                buttonView.element.dataset.align = position;
                buttonView.element.title = query('GET_SELECT_IMAGE_BUTTON_TITLE');
                buttonView.on('click', root.ref.handleSelect);

                root.ref.buttonSelectItem = view.appendChildView(buttonView);
            } else {
                // view is file info
                const filenameElement = view.element.querySelector(
                    '.filepond--file-info-main'
                );
                const selectButton = document.createElement('button');
                selectButton.className = 'filepond--action-select-item-alt';
                selectButton.innerHTML =
                    icon + '<span>select</span>';
                selectButton.addEventListener('click', root.ref.handleSelect);
                filenameElement.appendChild(selectButton);

                root.ref.selectButton = selectButton;
            }
        };

        view.registerDestroyer(({ root }) => {
            if (root.ref.buttonSelectItem) {
                root.ref.buttonSelectItem.off('click', root.ref.handleSelect);
            }
            if (root.ref.selectButton) {
                root.ref.selectButton.removeEventListener(
                    'click',
                    root.ref.handleSelect
                );
            }
        });

        const routes = {
            DID_LOAD_ITEM: didLoadItem,
        };

        if (canShowImagePreview) {
            // view is file
            const didPreviewUpdate = ({ root }) => {
                if (!root.ref.buttonSelectItem) return;
                root.ref.buttonSelectItem.opacity = 1;
            };

            routes.DID_IMAGE_PREVIEW_SHOW = didPreviewUpdate;
        } else {
        }

        // start writing
        view.registerWriter(createRoute(routes));
    });

    // Expose plugin options
    return {
        options: {
            // enable or disable image selecting
            allowImageSelect: [true, Type.BOOLEAN],
            selectImageButtonTitle: ['Select image', Type.STRING],
            selectImageButtonPosition: ['bottom center', Type.STRING],
            selectImageButtonIcon: ['<svg viewBox="64 64 896 896" data-icon="select" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false" class=""><path d="M880 112H144c-17.7 0-32 14.3-32 32v736c0 17.7 14.3 32 32 32h360c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8H184V184h656v320c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8V144c0-17.7-14.3-32-32-32zM653.3 599.4l52.2-52.2a8.01 8.01 0 0 0-4.7-13.6l-179.4-21c-5.1-.6-9.5 3.7-8.9 8.9l21 179.4c.8 6.6 8.9 9.4 13.6 4.7l52.4-52.4 256.2 256.2c3.1 3.1 8.2 3.1 11.3 0l42.4-42.4c3.1-3.1 3.1-8.2 0-11.3L653.3 599.4z"></path></svg>', Type.STRING],
            selectCallback: [null, Type.FUNCTION],
        },
    };
};

// fire pluginloaded event if running in browser, this allows registering the plugin when using async script tags
const isBrowser =
    typeof window !== 'undefined' && typeof window.document !== 'undefined';
if (isBrowser) {
    document.dispatchEvent(
        new CustomEvent('FilePond:pluginloaded', { detail: plugin })
    );
}

export default plugin;

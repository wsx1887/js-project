const { Menu, MenuItem } = require('electron');

function createMenu() {
    let template=[
        {
            label:'窗口',
            submenu:[
                {
                    label:'开发者工具',
                    role:'toggleDevTools'
                }
            ]
        }
    ];
    let menu = Menu.buildFromTemplate(template);
    //if (win) { Menu.setApplicationMenu(menu); }
    return menu;
}

module.exports = createMenu;
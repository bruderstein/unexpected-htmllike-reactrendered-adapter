import Domino from 'domino';

if (!global.window) {
    global.window = Domino.createWindow('');
    global.document = window.document;
    global.navigator = {
        userAgent: 'Domino'
    }
}





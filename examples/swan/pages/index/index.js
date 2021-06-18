import createDocument from '../../dom';

Page({
    data: {
        root: []
    },
    onInit() {
        const document = createDocument(this)

        const viewEl1 = document.createElement('view')
        const textEl1 = document.createTextNode('hello, world1')
        viewEl1.appendChild(textEl1)

        const viewEl2 = document.createElement('view')
        const textEl2 = document.createTextNode('hello, world2')
        viewEl2.appendChild(textEl2)

        viewEl2.appendChild(viewEl1)
        document.appendChild(viewEl2)
    }
})

import createDocument from '../../dom';

Page({
    data: {
        root: [
            // {
			// 	uid: 1,
			// 	type: 'view',
			// 	class: 'container',
			// 	children: [
			// 		{
			// 			type: 'words',
            //             children: 'hello, world'
			// 		}
			// 	]
			// }
        ]
    },
    onInit() {
        const document = createDocument(this)

        const viewEl1 = document.createElement('view')
        viewEl1.textContent = 'hello, world1'
        const viewEl2 = document.createElement('view')
        viewEl2.textContent = 'hello, world2'
        viewEl2.appendChild(viewEl1)
        document.appendChild(viewEl2)
    }
})

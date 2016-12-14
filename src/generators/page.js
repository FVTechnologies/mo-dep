import resource from './resource';

export default function (params) {
    resource('page', params)
        .then(() => console.log('Happy new page!'))
        .catch((err) => console.error('Error:', err));
}
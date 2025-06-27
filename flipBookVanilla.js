import {PageFlip} from 'page-flip';
export function openFlipBook() {
  const popup = document.getElementById('popup-book');
  const book = document.getElementById('book');

  // 1) Tampilkan popup
  popup.classList.remove('hidden');

  // 2) Destroy kalau ada
  if (window.myFlipbook) {
    window.myFlipbook.destroy();
    window.myFlipbook = null;
  }

  // 3) Bersihkan isi book (jaga-jaga)
  book.innerHTML = '';

  // 4) Buat ulang instance
  window.myFlipbook = new PageFlip(document.getElementById('book'), {
    width: 500,
    height: 800,
    maxHeight: 800,
    maxWidth: 500,
    size: 'stretch',
    autoSize: true,
  });
  window.myFlipbook.loadFromImages([
    './src/pages/resume/1.jpg',
    './src/pages/resume/2.jpg'
  ]);
}
export function closeFlipBook() {
  const popup = document.getElementById('popup-book');
  popup.classList.add('hidden');

  if (window.myFlipbook) {
    window.myFlipbook.destroy();
    window.myFlipbook = null;
  }
}
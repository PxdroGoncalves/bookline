const catalog=document.getElementById('catalog');
const search=document.getElementById('search');
const sort=document.getElementById('sort');
const filters=document.getElementById('filters');
const empty=document.getElementById('empty');
const books=Array.isArray(window.BOOKS)?window.BOOKS:[];
let active='Todos';

const userReviews=id=>{try{return JSON.parse(localStorage.getItem('bookline_reviews_'+id)||'[]')}catch(e){return[]}};
const avg=b=>{const all=[...(b.reviews||[]),...userReviews(b.id)];return all.length?all.reduce((s,r)=>s+Number(r.rating||0),0)/all.length:0};
const genres=['Todos',...Array.from(new Set(books.map(b=>b.genre).filter(Boolean)))];

genres.forEach(g=>{
  const bt=document.createElement('button');
  bt.className='filter'+(g==='Todos'?' active':'');
  bt.textContent=g;
  bt.onclick=()=>{active=g;document.querySelectorAll('.filter').forEach(x=>x.classList.toggle('active',x===bt));render();};
  filters.appendChild(bt);
});
function stars(n){const v=Math.max(0,Math.min(5,Math.round(n)));return '★'.repeat(v)+'☆'.repeat(5-v)}
function render(){
  const q=search.value.trim().toLowerCase();
  const arr=books.filter(b=>(active==='Todos'||b.genre===active)&&(!q||(b.title+' '+b.author).toLowerCase().includes(q)));
  if(sort.value==='rating')arr.sort((a,b)=>avg(b)-avg(a));
  if(sort.value==='title')arr.sort((a,b)=>a.title.localeCompare(b.title,'pt-BR'));
  catalog.innerHTML=arr.map(b=>`<a class="book-card" href="livro.html?id=${encodeURIComponent(b.id)}"><div class="cover-wrap"><img src="${b.cover}" data-book-id="${b.id}" alt="Capa de ${b.title}" loading="lazy"><span class="genre-pill">${b.genre}</span></div><div class="book-info"><h3>${b.title}</h3><p class="author">${b.author}</p><div class="rating"><span class="stars">${stars(avg(b))}</span><span>${avg(b).toFixed(1)} · ${(b.reviews||[]).length+userReviews(b.id).length} avaliações</span></div><p class="book-desc-short">${b.description||''}</p></div></a>`).join('');
  empty.style.display=arr.length?'none':'block';
  if(typeof window.hydrateBookCovers==='function')window.hydrateBookCovers(catalog);
}
search.addEventListener('input',render);sort.addEventListener('change',render);render();

const root=document.getElementById('bookPage');
const books=Array.isArray(window.BOOKS)?window.BOOKS:[];
const params=new URLSearchParams(location.search);
const id=params.get('id');
const book=books.find(b=>b.id===id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const key=b=>'bookline_reviews_'+b.id;

function makeReviewId(){
  if(window.crypto&&typeof window.crypto.randomUUID==='function')return window.crypto.randomUUID();
  return 'review_'+Date.now()+'_'+Math.random().toString(36).slice(2,12);
}

function saveUserReviews(arr){
  if(!book)return;
  if(arr.length)localStorage.setItem(key(book),JSON.stringify(arr));
  else localStorage.removeItem(key(book));
}

function getUser(){
  if(!book)return[];
  let arr=[];
  try{
    const parsed=JSON.parse(localStorage.getItem(key(book))||'[]');
    arr=Array.isArray(parsed)?parsed:[];
  }catch(e){
    arr=[];
  }

  let changed=false;
  const used=new Set();
  arr=arr.map(r=>{
    const item={...(r||{})};
    let rid=String(item.reviewId||'');
    if(!rid||used.has(rid)){
      rid=makeReviewId();
      item.reviewId=rid;
      changed=true;
    }
    used.add(rid);
    return item;
  });
  if(changed)saveUserReviews(arr);
  return arr;
}

function starText(n){
  const v=Math.max(0,Math.min(5,Math.round(n)));
  return '★'.repeat(v)+'☆'.repeat(5-v);
}

function fixedReviews(){return book?(book.reviews||[]).map(r=>({...r,user:false})):[]}
function userReviews(){return getUser().map(r=>({...r,user:true}))}
function allReviews(){return [...fixedReviews(),...userReviews()]}
function reviewText(r){return r.comment??r.text??''}
function average(){
  const a=allReviews();
  return a.length?a.reduce((s,r)=>s+Number(r.rating||0),0)/a.length:0;
}

if(!document.getElementById('review-delete-styles')){
  const style=document.createElement('style');
  style.id='review-delete-styles';
  style.textContent='.review-actions{display:flex;justify-content:flex-end;margin-top:12px}.delete-review-btn{border:1px solid rgba(199,127,137,.45);background:transparent;color:#9f5862;padding:6px 10px;border-radius:6px;font:600 13px "Barlow Semi Condensed",Arial,sans-serif;cursor:pointer}.delete-review-btn:hover{background:#f7e4e7;border-color:#c77f89}.review.user-review{position:relative}';
  document.head.appendChild(style);
}

function deleteUserReview(reviewId){
  if(!book||!reviewId)return;
  const arr=getUser();
  const next=arr.filter(r=>String(r.reviewId)!==String(reviewId));
  if(next.length===arr.length)return;
  saveUserReviews(next);
  renderReviews();
}

function bindDeleteButtons(){
  document.querySelectorAll('.delete-review-btn').forEach(btn=>{
    btn.onclick=()=>{
      const reviewId=btn.getAttribute('data-review-id');
      if(!reviewId)return;
      const confirmed=window.confirm('Tem certeza que deseja excluir seu comentário?');
      if(!confirmed)return;
      deleteUserReview(reviewId);
    };
  });
}

if(!book){
  root.innerHTML='<section class="section"><div class="wrap"><h1>Livro não encontrado</h1><div class="actions"><a class="btn dark" href="catalogo.html">Voltar ao catálogo</a></div></div></section>';
}else{
  document.title=book.title+' — BookLine';
  const tags=[book.genre,book.category].filter((x,i,a)=>x&&a.indexOf(x)===i);
  const amazon='https://www.amazon.com.br/s?k='+encodeURIComponent(book.title+' '+book.author);
  root.innerHTML=`<section class="section"><div class="wrap"><div class="book-detail"><div><img class="detail-cover" src="${book.cover}" data-book-id="${book.id}" alt="Capa de ${esc(book.title)}"></div><div><p class="detail-kicker">${esc(book.genre)}</p><h1 class="detail-title">${esc(book.title)}</h1><p class="detail-author">${esc(book.author)}</p><div class="rating" id="topRating"></div><div class="tags">${tags.map(t=>`<span class="tag">${esc(t)}</span>`).join('')}</div><p class="detail-desc">${esc(book.description||'')}</p><div class="buy-box"><div><strong>Onde comprar</strong><small>O botão abre a pesquisa deste título na Amazon Brasil para você escolher a edição.</small></div><a class="btn primary" href="${amazon}" target="_blank" rel="noopener">Ver na Amazon</a></div><div class="actions"><a class="btn soft" href="catalogo.html">← Voltar ao catálogo</a></div></div></div></div></section><section class="section alt"><div class="wrap"><div class="section-head"><p class="kicker">Opinião dos leitores</p><h2>Avaliações e comentários</h2><p id="reviewSummary"></p></div><div class="reviews-layout"><div class="review-list" id="reviews"></div><form class="form-card" id="reviewForm"><h3>Deixe sua avaliação</h3><p>Sua avaliação fica salva neste navegador.</p><div class="form-row"><label for="name">Seu nome</label><input class="input" id="name" required maxlength="40" placeholder="Ex.: Pedro"></div><div class="form-row"><label>Sua nota</label><div class="star-input"><input id="s5" name="rating" type="radio" value="5" required><label for="s5">★</label><input id="s4" name="rating" type="radio" value="4"><label for="s4">★</label><input id="s3" name="rating" type="radio" value="3"><label for="s3">★</label><input id="s2" name="rating" type="radio" value="2"><label for="s2">★</label><input id="s1" name="rating" type="radio" value="1"><label for="s1">★</label></div></div><div class="form-row"><label for="comment">Comentário</label><textarea class="textarea" id="comment" rows="5" required maxlength="600" placeholder="O que você achou do livro?"></textarea></div><button class="btn dark" type="submit">Publicar avaliação</button><div class="notice" id="notice">Avaliação adicionada!</div></form></div></div></section>`;
  if(typeof window.hydrateBookCovers==='function')window.hydrateBookCovers(root);
  renderReviews();

  document.getElementById('reviewForm').addEventListener('submit',e=>{
    e.preventDefault();
    const name=document.getElementById('name').value.trim();
    const comment=document.getElementById('comment').value.trim();
    const rating=document.querySelector('input[name="rating"]:checked');
    if(!name||!comment||!rating)return;

    const arr=getUser();
    arr.unshift({
      reviewId:makeReviewId(),
      name,
      rating:Number(rating.value),
      comment
    });
    saveUserReviews(arr);

    e.target.reset();
    const notice=document.getElementById('notice');
    notice.textContent='Avaliação adicionada!';
    notice.style.display='block';
    setTimeout(()=>notice.style.display='none',2500);
    renderReviews();
  });
}

function renderReviews(){
  if(!book)return;
  const revs=allReviews();
  const av=average();
  document.getElementById('topRating').innerHTML=`<span class="stars">${starText(av)}</span><strong>${av.toFixed(1)}</strong><span>(${revs.length} avaliações)</span>`;
  document.getElementById('reviewSummary').textContent=`Média ${av.toFixed(1)} de 5, considerando ${revs.length} avaliações.`;
  document.getElementById('reviews').innerHTML=revs.map(r=>`<article class="review ${r.user?'user-review':''}"><div class="review-head"><span class="review-name">${esc(r.name)}</span><span class="stars">${starText(Number(r.rating))}</span></div><p>${esc(reviewText(r))}</p>${r.user?`<div class="review-actions"><button type="button" class="delete-review-btn" data-review-id="${esc(r.reviewId)}">Excluir meu comentário</button></div>`:''}</article>`).join('');
  bindDeleteButtons();
}

const menuBtn=document.getElementById('menuBtn');
const navLinks=document.getElementById('navLinks');
if(menuBtn&&navLinks){menuBtn.addEventListener('click',()=>navLinks.classList.toggle('open'));}
const BOOK_COVERS={
'amor-teoricamente':'https://livrariascuritiba.vteximg.com.br/arquivos/ids/2137195-1000-1000/lv505089_1.jpg?v=638240665788770000','melhor-do-que-nos-filmes':'https://down-br.img.susercontent.com/file/sg-11134201-821fr-mgnocrbyb2mkbc','mil-vezes-amor':'https://static.wixstatic.com/media/62fbbf_9daac27ef03741f5a7b9d6bd4b300aef~mv2.jpg/v1/fill/w_1000,h_1000,al_c,q_85,enc_avif,quality_auto/62fbbf_9daac27ef03741f5a7b9d6bd4b300aef~mv2.jpg','apostando-no-amor':'https://down-br.img.susercontent.com/file/sg-11134201-7rdxy-m0xbsfv8cvzzff','e-assim-que-comeca':'https://livrariascuritiba.vteximg.com.br/arquivos/ids/2055197-1000-1000/LV493614.jpg?v=638441099977300000','e-assim-que-acaba':'https://is1-ssl.mzstatic.com/image/thumb/Publication118/v4/24/34/2e/24342ee1-5c16-0699-c90d-24fd04a31a95/1023431982.jpg/1200x1200wz.jpg','todas-as-suas-imperfeicoes':'https://down-br.img.susercontent.com/file/br-11134207-7r98o-mabfld9br2ye01','os-sete-maridos-de-evelyn-hugo':'https://cdn.dooca.store/81243/products/setmarev-1.jpg?v=1751464374&webp=0','a-paciente-silenciosa':'https://americanas.vtexassets.com/arquivos/ids/30567633/134201959_1_xlarge.jpg?v=638966544750770000','sapiens':'https://livrariascuritiba.vteximg.com.br/arquivos/ids/1948845-1000-1000/LV467840.jpg?v=638619788744700000','a-biblioteca-da-meia-noite':'https://armazemdolivro.cdn.magazord.com.br/img/2024/09/produto/106/group-23.png?ims=600x600','torto-arado':'https://down-br.img.susercontent.com/file/br-11134207-7r98o-ls9xcpp1rtpgf7','1984':'https://down-br.img.susercontent.com/file/br-11134207-81z1k-mhjmpe1zedqe2d','a-revolucao-dos-bichos':'https://down-br.img.susercontent.com/file/sg-11134201-8261l-mk48jjbdf85kb0','quarto-de-despejo':'https://martinsfontespaulista.vteximg.com.br/arquivos/ids/1643148-1000-1000/748738.jpg?v=638556105228500000','percy-jackson-o-ladrao-de-raios':'https://down-br.img.susercontent.com/file/br-11134207-7r98o-luj9wc6ziulcbe','dom-casmurro':'https://images.tcdn.com.br/img/img_prod/1043052/dom_casmurro_12019_1_c24baa33081e8405255ef17ea4c377c1.jpg','tudo-nela-brilha-e-queima':'https://s2.glbimg.com/gEnLDtFHwfIPmdFDQ3avOJeOl9U=/e.glbimg.com/og/ed/f/original/2022/03/22/image8_2.jpg','a-hipotese-do-amor':'https://down-br.img.susercontent.com/file/sg-11134201-7rce1-lsegmb42ffwna6','a-razao-do-amor':'https://cdn.dooca.store/81243/products/sxiysd6vunyb4yfk6ptqwfil7woeygunqwbb.jpg?v=1676659959','verity':'https://down-br.img.susercontent.com/file/br-11134207-7r98o-maj47x4uoz9r56','como-eu-era-antes-de-voce':'https://down-br.img.susercontent.com/file/400235ffb36db37678e0c8cd543dab56','mil-beijos-de-garoto':'https://livrariascuritiba.vteximg.com.br/arquivos/ids/1715570-1000-1000/LV413779.jpg?v=638619785389730000'};
function resolveMedia(src){const media=window.BOOKLINE_MEDIA||{};if(media[src])return media[src];const jpeg=src.replace(/\.webp(?:\?.*)?$/i,'.jpeg');if(media[jpeg])return media[jpeg];const cover=src.match(/assets\/capas\/([^./]+)\.(?:jpg|jpeg|png|webp)/i);if(cover&&BOOK_COVERS[cover[1]])return BOOK_COVERS[cover[1]];return null;}
function applyMedia(img){if(!img||img.dataset.booklineMedia==='1')return;const original=img.getAttribute('src')||'';const url=resolveMedia(original);if(!url)return;img.dataset.booklineMedia='1';img.src=url;if(/^https?:/i.test(url))img.referrerPolicy='no-referrer';}
function hydrateBookCovers(root=document){if(root&&root.matches&&root.matches('img'))applyMedia(root);if(root&&root.querySelectorAll)root.querySelectorAll('img').forEach(applyMedia);}
window.hydrateBookCovers=hydrateBookCovers;
function loadEmbeddedMedia(){
  const files=new Set();
  document.querySelectorAll('img[src^="assets/turma/"],img[src^="assets/bienal/"]').forEach(img=>{
    const src=img.getAttribute('src')||'';
    const m=src.match(/^assets\/(?:turma|bienal)\/([^./]+)\.(?:jpe?g|webp|png)$/i);
    if(m)files.add(`assets/js/media/${m[1]}.js`);
  });
  files.forEach(src=>{
    if(document.querySelector(`script[data-bookline-media="${src}"]`))return;
    const s=document.createElement('script');
    s.src=src;
    s.dataset.booklineMedia=src;
    s.onload=()=>hydrateBookCovers(document);
    document.head.appendChild(s);
  });
}
loadEmbeddedMedia();
document.addEventListener('DOMContentLoaded',()=>{hydrateBookCovers(document);loadEmbeddedMedia();const observer=new MutationObserver(records=>records.forEach(record=>record.addedNodes.forEach(node=>{if(node.nodeType===1)hydrateBookCovers(node);})));observer.observe(document.body,{childList:true,subtree:true});});

export {esc} from './ui.js';
import {esc} from './ui.js';
export const icon=name=>`<i class="ri-${esc(name)}" aria-hidden="true"></i>`;
export function toast(message){const e=document.getElementById('toast');e.textContent=message;e.classList.add('visible');setTimeout(()=>e.classList.remove('visible'),4000);}

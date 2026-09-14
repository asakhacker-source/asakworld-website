/* Pure, bounded Boolean parser; UI is scoped to the calculator root. */
(function () {
  'use strict';
  const gates = {
    AND: { run: (a,b) => a & b, symbol: 'A · B', help: 'Output is HIGH only when both inputs are HIGH.' },
    OR: { run: (a,b) => a | b, symbol: 'A + B', help: 'Output is HIGH when at least one input is HIGH.' },
    NOT: { run: a => 1-a, symbol: 'A̅', help: 'Inverts the selected input.' },
    NAND: { run: (a,b) => 1-(a & b), symbol: '(A · B)̅', help: 'Inverse of AND: LOW only when both inputs are HIGH.' },
    NOR: { run: (a,b) => 1-(a | b), symbol: '(A + B)̅', help: 'Inverse of OR: HIGH only when both inputs are LOW.' },
    XOR: { run: (a,b) => a ^ b, symbol: 'A ⊕ B', help: 'Output is HIGH when the two inputs are different.' },
    XNOR: { run: (a,b) => 1-(a ^ b), symbol: '(A ⊕ B)̅', help: 'Output is HIGH when the two inputs are equal.' }
  };
  const priority = { OR:1, NOR:1, XOR:2, XNOR:2, AND:3, NAND:3 };
  function parse(text) {
    if (!text.trim()) throw Error('Enter a Boolean expression.');
    if (text.length > 1000) throw Error('Keep expressions within 1,000 characters.');
    const tokens = text.toUpperCase().match(/[A-Z]+|[01]|[()]|[^\s]/g) || [];
    if (tokens.length > 256) throw Error('Use no more than 256 tokens.');
    for (const t of tokens) if (!/^[A-H01()]$/.test(t) && !Object.hasOwn(gates,t)) throw Error(`Unknown token “${t}”. Use A–H, 0, 1 and named gates.`);
    let i=0; const variables=new Set();
    function expression(min=0,depth=0) {
      if(depth>32) throw Error('Nesting is limited to 32 levels.');
      const t=tokens[i++]; let node;
      if(t==='NOT') node={op:t,left:expression(4,depth+1)};
      else if(t==='(') { node=expression(0,depth+1); if(tokens[i++]!==')') throw Error('Missing closing parenthesis.'); }
      else if(/^[A-H]$/.test(t || '')) { variables.add(t); node={variable:t}; }
      else if(t==='0'||t==='1') node={value:Number(t)};
      else throw Error('Missing operand. Use a variable, 0, 1 or a parenthesized expression.');
      while(Object.hasOwn(priority,tokens[i]) && priority[tokens[i]]>=min) {
        const op=tokens[i++];node={op,left:node,right:expression(priority[op]+1,depth+1)};
      }
      return node;
    }
    const tree=expression();
    if(i!==tokens.length) throw Error('Unexpected token or missing operator. Check your parentheses.');
    return {tree,variables:[...variables].sort()};
  }
  function evaluate(node,values,steps=[]) {
    if(node.variable) {const v=values[node.variable];if(v!==0&&v!==1)throw Error('Inputs must be 0 or 1.');return v;}
    if(node.value!==undefined)return node.value;
    const a=evaluate(node.left,values,steps),b=node.right?evaluate(node.right,values,steps):undefined;
    const label=(n,v)=>n.variable || String(v);
    const result=gates[node.op].run(a,b);
    steps.push(`${node.op==='NOT'?'NOT '+label(node.left,a):label(node.left,a)+' '+node.op+' '+label(node.right,b)} = ${result}`);
    return result;
  }
  function truthTable(parsed) {
    return Array.from({length:2**parsed.variables.length},(_,index)=>{
      const values=Object.fromEntries(parsed.variables.map((v,j)=>[v,(index >> (parsed.variables.length-j-1)) & 1]));
      return {...values,OUTPUT:evaluate(parsed.tree,values)};
    });
  }
  if(typeof module!=='undefined' && module.exports)module.exports={parse,evaluate,truthTable,gates};
  if(typeof document==='undefined')return;
  const root=document.getElementById('boolean-calculator');if(!root)return;
  const $=id=>root.querySelector('#'+id);
  const make=(tag,text)=>{const el=document.createElement(tag);if(text!==undefined)el.textContent=text;return el;};
  function toggle(name,value,change) {
    const b=make('button',`${name} = ${value}`);b.type='button';b.className='logic-toggle';b.setAttribute('aria-pressed',String(Boolean(value)));
    b.addEventListener('click',()=>{value=1-value;b.textContent=`${name} = ${value}`;b.setAttribute('aria-pressed',String(Boolean(value)));change(value);});return b;
  }
  function options(select,items){items.forEach(v=>{const o=make('option',v);o.value=v;select.append(o);});}
  options($('logic-gate'),Object.keys(gates));
  const basic={A:0,B:0};
  function basicUpdate(){const gate=$('logic-gate').value,unary=gate==='NOT',input=$('logic-not-input').value;
    $('logic-basic-b').hidden=unary;$('logic-not-label').hidden=!unary;
    const value=gates[gate].run(unary?basic[input]:basic.A,basic.B);
    $('logic-basic-result').textContent=unary?`NOT ${input} (${basic[input]}) = ${value}`:`A (${basic.A}) ${gate} B (${basic.B}) = ${value}`;
    $('logic-gate-help').textContent=gates[gate].help;
    $('logic-symbol').textContent='Y = '+(unary?input+'̅':gates[gate].symbol);
  }
  function basicControls(){ $('logic-basic-inputs').replaceChildren();
    const unary=$('logic-gate').value==='NOT',names=unary?[$('logic-not-input').value]:['A','B'];
    names.forEach(n=>{const wrap=make('span');if(n==='B'&&!unary)wrap.id='logic-basic-b';wrap.append(toggle(n,basic[n],v=>{basic[n]=v;basicUpdate();}));$('logic-basic-inputs').append(wrap);});
    // Keep a hidden target for the binary-only control when NOT is selected.
    if(unary){const dummy=make('span');dummy.id='logic-basic-b';dummy.hidden=true;$('logic-basic-inputs').append(dummy);}basicUpdate();
  }
  $('logic-gate').addEventListener('change',basicControls);$('logic-not-input').addEventListener('change',basicControls);basicControls();
  let parsed=null;const values={};
  function calculate(){if(!parsed)return;const steps=[];const result=evaluate(parsed.tree,values,steps);$('logic-result').textContent=`Output: ${result} (${result?'TRUE / HIGH':'FALSE / LOW'})`;
    $('logic-steps').replaceChildren(...(steps.length?steps:['Direct input = '+result]).map(s=>make('li',s)));}
  function update(){ $('logic-table').replaceChildren();$('logic-error').textContent='';
    try {parsed=parse($('logic-expression').value);$('logic-expression').setAttribute('aria-invalid','false');$('logic-inputs').replaceChildren();
      parsed.variables.forEach(n=>{values[n]??=0;$('logic-inputs').append(toggle(n,values[n],v=>{values[n]=v;calculate();}));});
      if(!parsed.variables.length)$('logic-inputs').textContent='Constant expression — no variable inputs.';
      $('logic-truth').disabled=false;calculate();
    }catch(e){parsed=null;$('logic-expression').setAttribute('aria-invalid','true');$('logic-error').textContent=e.message;$('logic-inputs').replaceChildren();$('logic-result').textContent='Output unavailable';$('logic-steps').replaceChildren();$('logic-truth').disabled=true;}}
  $('logic-expression').addEventListener('input',update);$('logic-calculate').addEventListener('click',update);
  function table(headers,rows,caption){const t=make('table'),head=make('thead'),tr=make('tr');t.append(make('caption',caption));headers.forEach(h=>{const th=make('th',h);th.scope='col';tr.append(th);});head.append(tr);t.append(head);const body=make('tbody');rows.forEach(r=>{const row=make('tr');r.forEach(v=>row.append(make('td',String(v))));body.append(row);});t.append(body);return t;}
  $('logic-truth').addEventListener('click',()=>{if(!parsed)return;const headers=[...parsed.variables,'OUTPUT'];const rows=truthTable(parsed);$('logic-table').replaceChildren(table(headers,rows.map(r=>headers.map(h=>r[h])),`${$('logic-expression').value} — ${rows.length} combinations`));});
  ['A AND B','A OR B','A NAND B','A XOR B','(A AND B) OR C','(A OR B) AND C','(A NAND B) XOR C','(A AND B) OR (C AND D)'].forEach(expr=>{const b=make('button',expr);b.type='button';b.addEventListener('click',()=>{$('logic-expression').value=expr;update();});$('logic-presets').append(b);});
  Object.entries(gates).forEach(([name,g])=>{const card=make('article');card.append(make('h4',name),make('p','Y = '+g.symbol),make('p',g.help));const unary=name==='NOT';card.append(table(unary?['A','Y']:['A','B','Y'],unary?[[0,1],[1,0]]:[[0,0],[0,1],[1,0],[1,1]].map(([a,b])=>[a,b,g.run(a,b)]),name+' truth table'));$('logic-reference').append(card);});
  const variables='ABCDEFGH'.split('');options($('logic-chain-start'),variables);
  function chainExpression(){let expr=$('logic-chain-start').value;for(const row of $('logic-chain').children){const gate=row.querySelector('select').value,input=row.querySelectorAll('select')[1];input.disabled=gate==='NOT';expr=gate==='NOT'?`NOT(${expr})`:`(${expr} ${gate} ${input.value})`;row.querySelector('p').textContent=gates[gate].help;}$('logic-chain-expression').textContent=expr;return expr;}
  function addGate(){if($('logic-chain').children.length>=16)return;const row=make('div');row.className='logic-chain-row';const label=make('label','Gate '),gate=make('select');options(gate,Object.keys(gates));label.append(gate);const inputLabel=make('label','Input '),input=make('select');options(input,variables);input.value='B';inputLabel.append(input);const remove=make('button','Remove gate');remove.type='button';remove.addEventListener('click',()=>{row.remove();$('logic-add').disabled=false;chainExpression();});row.append(label,inputLabel,remove,make('p'));row.addEventListener('change',chainExpression);$('logic-chain').append(row);$('logic-add').disabled=$('logic-chain').children.length>=16;chainExpression();}
  $('logic-add').addEventListener('click',addGate);$('logic-chain-start').addEventListener('change',chainExpression);
  $('logic-chain-use').addEventListener('click',()=>{$('logic-expression').value=chainExpression();update();$('logic-expression').focus();});addGate();update();
})();

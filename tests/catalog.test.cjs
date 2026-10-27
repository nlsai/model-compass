const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const html = fs.readFileSync(require('node:path').join(__dirname, '..', 'index.html'), 'utf8');
const script = html.split('<script>')[1].split('</script>')[0];
function start(fetchImpl) {
  const defaults = {task:'coding',location:'any',context:'0',integration:'any',priority:'quality',price:'all',sort:'fit',requests:'10000',inputTokens:'2000',outputTokens:'500',search:''};
  const elements = Object.fromEntries(['task','location','context','integration','priority','price','sort','requests','inputTokens','outputTokens','search','catalog-status','count','recommendation','cards','more','table','reset'].map(id => [id, {
    value: defaults[id] || '', innerHTML:'', textContent:'', style:{}, selectedIndex:0,
    listeners:{}, addEventListener(name, fn){ this.listeners[name]=fn; }, querySelectorAll(){ return []; }
  }]));
  const ctx = vm.createContext({document:{getElementById:id=>elements[id]},fetch:fetchImpl,AbortSignal,Date,Number,String,Array,Map,Math,Error,encodeURIComponent,console});
  vm.runInContext(script, ctx);
  return {ctx,elements};
}
const fakeModel = (id, input, output, name) => ({id, name, description:'Provider description', context_length:131072, architecture:{input_modalities:['text'],output_modalities:['text']}, pricing:{prompt:input,completion:output},supported_parameters:['tools']});
const settle = () => new Promise(resolve=>setImmediate(resolve));
test('loads free and paid text models and converts prices per million tokens', async () => {
  const {ctx,elements}=start(async()=>({ok:true,json:async()=>({data:[fakeModel('maker/free:free','0','0','Free One'),fakeModel('maker/pro','0.000003','0.000015','Pro One')]})}));
  await settle();
  assert.match(elements['catalog-status'].textContent,/LIVE OPENROUTER/);
  assert.match(elements.cards.innerHTML,/Free One/);
  assert.match(elements.cards.innerHTML,/\$3 input · \$15 output/);
  elements.price.value='paid';vm.runInContext('render()',ctx);
  assert.match(elements.cards.innerHTML,/Pro One/);
  assert.doesNotMatch(elements.cards.innerHTML,/Free One/);
  elements.search.value='not-a-model';vm.runInContext('render()',ctx);
  assert.match(elements.recommendation.innerHTML,/No model matches/);
});
test('zero token pricing on an unverified endpoint is marked variable', async () => {
  const {ctx,elements}=start(async()=>({ok:true,json:async()=>({data:[fakeModel('maker/other','0','0','Other Charges')]})}));
  await settle();
  elements.price.value='free';vm.runInContext('render()',ctx);
  assert.doesNotMatch(elements.cards.innerHTML,/Other Charges/);
  elements.price.value='variable';vm.runInContext('render()',ctx);
  assert.match(elements.cards.innerHTML,/Other Charges/);
  assert.match(elements.cards.innerHTML,/Check other charges/);
});
test('falls back to a labeled snapshot if the live catalog fails', async () => {
  const {elements}=start(async()=>{throw Error('offline')});
  await settle();
  assert.match(elements['catalog-status'].textContent,/SNAPSHOT/);
  assert.match(elements.cards.innerHTML,/North Mini Code/);
});
test('escapes provider-controlled text', async () => {
  const {elements}=start(async()=>({ok:true,json:async()=>({data:[fakeModel('maker/test','0.000001','0.000002','<img src=x onerror=alert(1)>')]})}));
  await settle();
  assert.doesNotMatch(elements.cards.innerHTML,/<img src=x/);
  assert.match(elements.cards.innerHTML,/&lt;img src=x/);
});

test('estimates monthly usage and flags variable pricing', async () => {
  const {ctx,elements}=start(async()=>({ok:true,json:async()=>({data:[fakeModel('maker/pro','0.000003','0.000015','Pro One')]})}));
  await settle();
  assert.equal(vm.runInContext("estimate(models.find(m=>m.cmd==='maker/pro'))",ctx),'$135');
  elements.requests.value='0';
  assert.equal(vm.runInContext("estimate(models.find(m=>m.cmd==='maker/pro'))",ctx),'$0');
});

test('invalid workload does not appear as a free estimate', async () => {
  const {ctx,elements}=start(async()=>({ok:true,json:async()=>({data:[fakeModel('maker/pro','0.000003','0.000015','Pro One')]})}));
  await settle();
  for (const input of ['', '-1', '1.5', '100000001']) {
    elements.requests.value=input;
    assert.equal(vm.runInContext("estimate(models.find(m=>m.cmd==='maker/pro'))",ctx),'Enter valid workload');
  }
});

test('unknown prices remain unquoted and cannot appear in free filter', async () => {
  const model=fakeModel('maker/unknown', null, null, 'Unknown Rate');
  const {ctx,elements}=start(async()=>({ok:true,json:async()=>({data:[model]})}));
  await settle();
  assert.equal(vm.runInContext("estimate(models.find(m=>m.cmd==='maker/unknown'))",ctx),'Check provider');
  elements.price.value='free';vm.runInContext('render()',ctx);
  assert.doesNotMatch(elements.cards.innerHTML,/Unknown Rate/);
});

test('sorts paid models by input price and does not imply a quality ranking', async () => {
  const {ctx,elements}=start(async()=>({ok:true,json:async()=>({data:[fakeModel('vendor/expensive','0.00002','0.00001','Costly'),fakeModel('vendor/cheap','0.000001','0.00001','Budget')]})}));
  await settle();
  elements.location.value='hosted';elements.price.value='paid';elements.sort.value='input';vm.runInContext('render()',ctx);
  assert.ok(elements.cards.innerHTML.indexOf('Budget') < elements.cards.innerHTML.indexOf('Costly'));
  assert.match(elements.recommendation.innerHTML,/not been rated/);
});

test('excludes models without text input or output', async () => {
  const wrong=fakeModel('vendor/image','0','0','Image Only');wrong.architecture.output_modalities=['image'];
  const {elements}=start(async()=>({ok:true,json:async()=>({data:[wrong,fakeModel('vendor/text','0.000001','0.000001','Text Model')]})}));
  await settle();
  assert.doesNotMatch(elements.cards.innerHTML,/Image Only/);
  assert.match(elements.cards.innerHTML,/Text Model/);
});

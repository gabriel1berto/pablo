-- ══════════════════════════════════════════════════════════
-- PABLO — Checklist Genérico
-- Aparece para qualquer modelo sem itens específicos cadastrados
-- model_pattern = 'Generico', cobre todos os anos e km
-- ══════════════════════════════════════════════════════════

DELETE FROM car_issues WHERE model_pattern = 'Generico';

INSERT INTO car_issues (brand, model_pattern, year_from, year_to, km_from, km_to, category, title, description, severity, sort_order) VALUES

-- ── MOTOR ──────────────────────────────────────────────────
('Generico', 'Generico', 0, 9999, 0, 999999, 'motor',
  'Fumaça azul no escapamento',
  'Indica óleo sendo queimado — anéis, guias de válvula ou retentores desgastados. Observe na aceleração e desaceleração. Custo estimado: R$ 1.500–4.000.',
  'critical', 1),

('Generico', 'Generico', 0, 9999, 0, 999999, 'motor',
  'Fumaça branca persistente',
  'Sinal clássico de junta do cabeçote rompida — fluido de arrefecimento entrando na câmara de combustão. Diferente do vapor frio no arranque. Custo: R$ 1.500–3.000.',
  'critical', 2),

('Generico', 'Generico', 0, 9999, 0, 999999, 'motor',
  'Nível e cor do óleo',
  'Verificar com motor frio. Óleo leitoso/esbranquiçado = junta do cabeçote. Óleo muito preto e pastoso = falta de troca prolongada. Nível abaixo do mínimo = consumo anormal.',
  'warn', 3),

('Generico', 'Generico', 0, 9999, 0, 999999, 'motor',
  'Fluido de arrefecimento',
  'Nível no reservatório deve estar entre min e max. Cor marrom/enferrujada indica sistema sem manutenção. Bolhas ou cor leitosa = possível mistura com óleo.',
  'warn', 4),

('Generico', 'Generico', 0, 9999, 0, 999999, 'motor',
  'Vazamento de óleo',
  'Estacionar em local limpo por 5 minutos e verificar o chão embaixo do motor. Mancha fresca = vazamento ativo em juntas, retentores ou tampa de válvulas.',
  'warn', 5),

('Generico', 'Generico', 0, 9999, 0, 999999, 'motor',
  'Ruído metálico em marcha lenta',
  '"Tic-tic" rápido = tuchos sem regulagem. Batida mais grave = mancais ou bielas. Ruído some com o esquentamento pode ser tuchos. Custo: R$ 300–5.000+ dependendo da causa.',
  'critical', 6),

-- ── TRANSMISSÃO ─────────────────────────────────────────────
('Generico', 'Generico', 0, 9999, 0, 999999, 'transmissao',
  'Câmbio manual — engates e ruídos',
  'Testar todas as marchas em movimento. Resistência excessiva, ruído de raspar ou marcha "saltando" indicam sincronizadores desgastados. Custo revisão: R$ 800–2.500.',
  'warn', 1),

('Generico', 'Generico', 0, 9999, 0, 999999, 'transmissao',
  'Câmbio automático — solavanco entre marchas',
  'Trocas devem ser imperceptíveis. Solavanco, demora ou marcha "pendurada" indica óleo vencido ou revisão necessária. Troca de óleo: R$ 300. Revisão completa: R$ 1.500–5.000.',
  'warn', 2),

('Generico', 'Generico', 0, 9999, 0, 999999, 'transmissao',
  'Embreagem (manual) — patinação e altura',
  'Em 3ª marcha, acelerar forte: motor sobe mas carro não acompanha = embreagem patinando. Pedal muito baixo = disco no fim da vida. Custo kit embreagem: R$ 600–1.500.',
  'warn', 3),

-- ── SUSPENSÃO ───────────────────────────────────────────────
('Generico', 'Generico', 0, 9999, 0, 999999, 'suspensao',
  'Ruído ao passar em lombada ou curva',
  '"Clac-clac" em curva = junta homocinética gasta. Batida seca em lombada = amortecedor ou bucha desgastada. Rangido = barra estabilizadora. Custo: R$ 300–1.500 por peça.',
  'warn', 1),

('Generico', 'Generico', 0, 9999, 0, 999999, 'suspensao',
  'Carro desvia em linha reta',
  'Soltar o volante brevemente em reta: carro deve seguir em frente. Desvio acentuado = desalinhamento, suspensão danificada ou pneus com pressão diferente. Custo: R$ 100–600.',
  'warn', 2),

('Generico', 'Generico', 0, 9999, 0, 999999, 'suspensao',
  'Vibração no volante',
  'Em velocidade constante (~80 km/h) = balanceamento (R$ 60–100). Ao frear = disco empenado (R$ 250–500). Constante = problema na direção ou cubo de roda (R$ 400–1.000).',
  'warn', 3),

('Generico', 'Generico', 0, 9999, 0, 999999, 'suspensao',
  'Teste dos amortecedores',
  'Pressionar com força cada canto do carro para baixo e soltar: deve parar em no máximo 1 oscilação. Mais de 2 = amortecedor gasto. Custo por par: R$ 400–900.',
  'warn', 4),

-- ── FREIOS ──────────────────────────────────────────────────
('Generico', 'Generico', 0, 9999, 0, 999999, 'freios',
  'Firmeza do pedal de freio',
  'Pedal deve ser alto e firme. Pedal mole, esponjoso ou que afunda lentamente = ar no sistema ou cilindro-mestre com defeito. Risco de segurança imediato. Custo: R$ 300–800.',
  'critical', 1),

('Generico', 'Generico', 0, 9999, 0, 999999, 'freios',
  'Vibração ao frear',
  'Volante ou pedal tremem durante a frenagem = discos empenados. Comum em carros que frearam muito a quente. Custo substituição por par: R$ 250–500.',
  'warn', 2),

('Generico', 'Generico', 0, 9999, 0, 999999, 'freios',
  'Ruído metálico ao frear',
  'Chiado agudo = pastilhas no limite com indicador sonoro. Rangido grave = pastilha zerada raspando no disco. Não ignorar — disco danificado aumenta o custo. Custo: R$ 200–450.',
  'warn', 3),

('Generico', 'Generico', 0, 9999, 0, 999999, 'freios',
  'Freio de mão',
  'Com carro em rampa leve, acionar o freio de mão: deve segurar com 3–5 cliques. Mais de 7 cliques = cabo esticado ou pastilha traseira gasta. Custo: R$ 100–300.',
  'warn', 4),

-- ── PNEUS ───────────────────────────────────────────────────
('Generico', 'Generico', 0, 9999, 0, 999999, 'pneus',
  'Profundidade dos sulcos',
  'Inserir uma moeda de R$ 0,10 no sulco: se a borda dourada sumir, está no limite legal (1,6mm). Sulco raso = troca imediata. Jogo de 4 pneus: R$ 800–2.200.',
  'critical', 1),

('Generico', 'Generico', 0, 9999, 0, 999999, 'pneus',
  'Desgaste irregular',
  'Desgaste só no centro = pressão alta. Só nas bordas = pressão baixa. Só de um lado = geometria errada. Qualquer desgaste assimétrico indica problema a investigar antes de trocar.',
  'warn', 2),

('Generico', 'Generico', 0, 9999, 0, 999999, 'pneus',
  'Bolhas, cortes ou danos na lateral',
  'Bolha na lateral = estrutura interna rompida. Risco real de estouro em alta velocidade. Troca imediata, sem negociação. Custo unitário: R$ 200–550.',
  'critical', 3),

('Generico', 'Generico', 0, 9999, 0, 999999, 'pneus',
  'Data de fabricação (DOT)',
  'Verificar código DOT na lateral: últimos 4 dígitos = semana e ano (ex: 2319 = 23ª semana de 2019). Pneu com mais de 5 anos deve ser trocado mesmo com sulco bom. Custo: R$ 200–550 cada.',
  'warn', 4),

-- ── CARROCERIA ──────────────────────────────────────────────
('Generico', 'Generico', 0, 9999, 0, 999999, 'carroceria',
  'Frestas entre painéis',
  'Observar com atenção as frestas entre capô, portas, para-lamas e para-choque. Fresta irregular ou assimétrica indica painel trocado após colisão. Custo reparo: R$ 500–3.000.',
  'warn', 1),

('Generico', 'Generico', 0, 9999, 0, 999999, 'carroceria',
  'Pintura desuniforme entre painéis',
  'Comparar tonalidade dos painéis ao sol natural. Tom diferente = repintura. Usar ímã: não gruda em massa ou fibra. Massa excessiva = deformação escondida.',
  'warn', 2),

('Generico', 'Generico', 0, 9999, 0, 999999, 'carroceria',
  'Ferrugem nos soleiros',
  'Com lanterna, inspecionar a parte de baixo das portas (soleiros). Ferrugem estrutural nos soleiros é o ponto mais crítico — afeta rigidez do chassi. Custo restauro: R$ 800–3.500.',
  'critical', 3),

('Generico', 'Generico', 0, 9999, 0, 999999, 'carroceria',
  'Ferrugem nas passarotas traseiras',
  'Área atrás dos para-lamas traseiros, atrás das rodas. Ferrugem avançada nesse ponto compromete a estrutura de fixação da suspensão traseira. Custo: R$ 600–2.500.',
  'critical', 4),

('Generico', 'Generico', 0, 9999, 0, 999999, 'carroceria',
  'Umidade e vedações',
  'Verificar carpete do assoalho e do porta-malas com a mão — umidade indica vedação comprometida ou solda com falha. Odor de mofo confirma. Custo tratamento: R$ 300–1.200.',
  'warn', 5),

-- ── ELÉTRICA ────────────────────────────────────────────────
('Generico', 'Generico', 0, 9999, 0, 999999, 'eletrica',
  'Luzes e sinalizadores',
  'Testar: faróis baixo e alto, setas dianteiras e traseiras, luz de freio (pedir ajuda), marcha ré, lanterna traseira e luz de placa. Lâmpada queimada indica descuido geral.',
  'warn', 1),

('Generico', 'Generico', 0, 9999, 0, 999999, 'eletrica',
  'Luzes de aviso no painel',
  'Com carro ligado e aquecido, nenhuma luz de aviso deve ficar acesa. Check engine, ABS, airbag ou bateria acesas indicam falhas ativas. Diagnóstico: R$ 100–200. Conserto: varia muito.',
  'critical', 2),

('Generico', 'Generico', 0, 9999, 0, 999999, 'eletrica',
  'Ar-condicionado',
  'Ligar no máximo com carro parado. Deve esfriar em menos de 2 minutos. Sem frio = recarga de gás (R$ 200–400) ou compressor com defeito (R$ 800–2.000).',
  'warn', 3),

('Generico', 'Generico', 0, 9999, 0, 999999, 'eletrica',
  'Vidros e travas elétricas',
  'Testar todos os vidros elétricos subindo e descendo completamente, e todas as travas das portas. Regulador de vidro travado é falha comum e cara. Custo por porta: R$ 150–600.',
  'warn', 4),

-- ── DOCUMENTAÇÃO ────────────────────────────────────────────
('Generico', 'Generico', 0, 9999, 0, 999999, 'documentacao',
  'Chassi confere com CRLV',
  'Verificar a plaqueta do chassi no painel (lado do motorista) e no batente da porta. Deve bater exatamente com o número no CRLV. Qualquer divergência = não compre.',
  'critical', 1),

('Generico', 'Generico', 0, 9999, 0, 999999, 'documentacao',
  'Número do motor nos documentos',
  'Em alguns veículos o número do motor consta no CRLV. Verificar se confere. Motor trocado sem registro em cartório é irregular e pode impedir a transferência.',
  'critical', 2);

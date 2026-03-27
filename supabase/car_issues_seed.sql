-- ══════════════════════════════════════════════════════════
-- PABLO — car_issues seed v2
-- 10 modelos · 10–18 problemas cada · descrições com custo
-- Colar no Supabase: SQL Editor → New query → Run
-- ══════════════════════════════════════════════════════════

TRUNCATE TABLE car_issues RESTART IDENTITY;

-- ──────────────────────────────────────────────
-- 1. RENAULT DUSTER (2013–2019) · Motor K4M/H4M
-- ──────────────────────────────────────────────
INSERT INTO car_issues (brand, model_pattern, year_from, year_to, km_from, km_to, category, title, description, severity, sort_order) VALUES

-- 0–30k
('Renault','Duster',2013,2019,0,30000,'suspensao','Ruído nas juntas homocinéticas','Clac-clac em curva fechada já com pouco uso — defeito de fábrica em lotes 2013–2015. Ignorado, quebra e deixa o carro parado. Custo: R$ 700–1.200.','critical',1),
('Renault','Duster',2013,2019,0,30000,'motor','Consumo de óleo acima do normal','K4M consome até 0,5L a cada 2.000 km. Se o nível baixar demais, o motor trava. Exija histórico de abastecimentos. Custo de correção: R$ 1.500–3.500.','warn',2),
('Renault','Duster',2013,2019,0,30000,'carroceria','Ferrugem nos soleiros e passarotas','Aparece cedo em carros de regiões úmidas ou litorâneas. Ferrugem estrutural compromete o chassi e invalida vistoria. Custo de restauro: R$ 900–3.000.','warn',3),
('Renault','Duster',2013,2019,0,30000,'eletrica','Falha no módulo de vidros elétricos','Janelas travam ou param de funcionar sem aviso. Problema recorrente de fábrica nessa geração. Custo por porta: R$ 300–600.','warn',4),

-- 30k–60k
('Renault','Duster',2013,2019,30000,60000,'motor','Correia dentada — 1ª troca vencida','Fabricante manda trocar a cada 60.000 km. Ruptura destrói o motor em segundos — reparo custa mais que o carro vale. Exija comprovante ou negocie desconto. Custo: R$ 700–1.000.','critical',1),
('Renault','Duster',2013,2019,30000,60000,'motor','Sensor CMP — falha P0340','Motor trepida no arranque e pode falhar em marcha lenta. Sensor de posição do comando de válvulas falha entre 40k–60k. Custo: R$ 250–450.','warn',2),
('Renault','Duster',2013,2019,30000,60000,'suspensao','Juntas homocinéticas desgastadas','Alta incidência nessa faixa. Ruído em curva = troca iminente. Se a junta quebrar em movimento, perde o controle do carro. Custo: R$ 800–1.400.','critical',3),
('Renault','Duster',2013,2019,30000,60000,'freios','Discos dianteiros empenados','Discos de série finos empenam com frenagem intensa. Vibração no pedal em alta velocidade = risco de acidente. Custo par: R$ 350–600.','warn',4),
('Renault','Duster',2013,2019,30000,60000,'eletrica','Módulo de injeção com falhas','Gera luz de motor acesa, consumo alto e engasgos. Reprogramação ou troca do módulo é cara. Custo: R$ 600–1.800.','warn',5),

-- 60k–100k
('Renault','Duster',2013,2019,60000,100000,'motor','2ª troca de correia dentada','Segunda troca obrigatória. Sem comprovante, o risco é seu. Motor destruído por ruptura = R$ 4.000–8.000 de reparo. Exija desconto equivalente. Custo da troca: R$ 700–1.000.','critical',1),
('Renault','Duster',2013,2019,60000,100000,'motor','Bicos injetores entupidos','Engasgos na aceleração, consumo alto, fumaça preta. Limpeza ultrassônica resolve — se ignorado, troca os bicos. Custo: R$ 300–1.200.','warn',2),
('Renault','Duster',2013,2019,60000,100000,'transmissao','Óleo do câmbio AT vencido','Troca obrigatória a cada 40k. Solavanco entre marchas = caixa com dano iniciado. Revisão completa custa R$ 2.000–5.000. Custo da troca preventiva: R$ 400.','critical',3),
('Renault','Duster',2013,2019,60000,100000,'suspensao','Amortecedores traseiros no limite','Quicar o para-choque: mais de 1 oscilação = troca necessária. Afeta frenagem e estabilidade. Custo par: R$ 500–900.','warn',4),
('Renault','Duster',2013,2019,60000,100000,'carroceria','Ferrugem estrutural nos soleiros','Nessa faixa já compromete a integridade do chassi. Reparo exige solda e tratamento anticorrosivo. Custo: R$ 1.200–3.500.','critical',5),

-- 100k+
('Renault','Duster',2013,2019,100000,999999,'motor','Correia dentada — 3ª troca urgente','A 110k+ você está bem além do prazo. Cada km rodado é roleta-russa. Ruptura = motor destruído. Custo de reparo sem troca preventiva: R$ 5.000–10.000.','critical',1),
('Renault','Duster',2013,2019,100000,999999,'motor','Junta do cabeçote com risco de ruptura','Histórico de superaquecimento (frequente nessa geração) danifica a junta. Fluido de arrefecimento leitoso = confirmação. Custo: R$ 1.800–3.500.','critical',2),
('Renault','Duster',2013,2019,100000,999999,'suspensao','Kit completo de suspensão dianteira','Pivôs, bandejas e buchas desgastados afetam direção e aprovação em vistoria. Custo completo: R$ 1.500–3.000.','critical',3),
('Renault','Duster',2013,2019,100000,999999,'transmissao','Caixa de transferência 4x4 — desgaste','Versões 4x4 com acima de 100k: verificar engajamento. Falha na caixa = R$ 2.500–5.000 de reparo.','warn',4),
('Renault','Duster',2013,2019,100000,999999,'eletrica','Alternador com desgaste','Alternadores nessa faixa costumam ter escovas no fim. Bateria não carrega, carro para na rua. Custo: R$ 500–1.200.','warn',5),

-- ──────────────────────────────────────────────
-- 2. CHEVROLET ONIX (2013–2019)
-- ──────────────────────────────────────────────
('Chevrolet','Onix',2013,2019,0,30000,'motor','Detonação no motor 1.4','Batida metálica em aceleração = pré-ignição. Lote 2013–2016 com problema de série. Ignorado, funde pistão. Custo: R$ 2.000–5.000.','critical',1),
('Chevrolet','Onix',2013,2019,0,30000,'eletrica','Módulo BCM com falhas','Travas, vidros e alarme com comportamento errático. Troca do módulo BCM é cara e exige reprogramação. Custo: R$ 800–2.000.','warn',2),
('Chevrolet','Onix',2013,2019,0,30000,'freios','Desgaste rápido das pastilhas','Pastilhas de série duram menos de 25k km. Verificar espessura — pastilha zerada raspa disco e triplica o custo. Custo pastilhas + discos: R$ 400–700.','warn',3),

('Chevrolet','Onix',2013,2019,30000,60000,'motor','Recall de pistão — motor 1.4','Lote específico com desgaste prematuro de pistão. Verificar se o recall foi atendido na concessionária. Sem atendimento, motor funde. Custo de reparo: R$ 3.000–7.000.','critical',1),
('Chevrolet','Onix',2013,2019,30000,60000,'suspensao','Rolamento de roda dianteiro','Zumbido crescente que piora com velocidade. Rolamento colapsado pode travar a roda em movimento. Custo unitário: R$ 300–600.','critical',2),
('Chevrolet','Onix',2013,2019,30000,60000,'eletrica','Sensor de airbag com defeito','Falha documentada em modelos 2013–2015. Airbag pode não acionar em colisão ou acionar sem motivo. Custo: R$ 400–900.','critical',3),
('Chevrolet','Onix',2013,2019,30000,60000,'motor','Correia de acessórios desgastada','Ruptura pára alternador, direção e ar-condicionado ao mesmo tempo. Custo de troca preventiva: R$ 150–300.','warn',4),

('Chevrolet','Onix',2013,2019,60000,100000,'transmissao','Solavanco no câmbio automático AT6','Troca de óleo ATF atrasada causa dano nos discos de embreagem interna. Revisão completa: R$ 1.500–4.000. Custo da troca preventiva: R$ 350.','critical',1),
('Chevrolet','Onix',2013,2019,60000,100000,'suspensao','Bucha e bieleta da barra estabilizadora','Barulho seco em pavimento ruim. Peças baratas mas se ignoradas danificam bandejas. Custo: R$ 200–450.','warn',2),
('Chevrolet','Onix',2013,2019,60000,100000,'motor','Velas e cabos de ignição vencidos','Motor engasga e consome mais. Velas de iridium duram 60k — troca simples se feita na hora certa. Custo: R$ 200–400.','warn',3),
('Chevrolet','Onix',2013,2019,60000,100000,'eletrica','Compressor de ar-condicionado ruidoso','Inicio de falha no compressor — ruído ao ligar o AC. Compressor travado danifica correia e motor. Custo: R$ 900–2.200.','warn',4),

('Chevrolet','Onix',2013,2019,100000,999999,'motor','Desgaste de mancais do motor','Batida grave em marcha lenta = mancais gastos. Reparo exige revisão completa do motor. Custo: R$ 3.000–8.000.','critical',1),
('Chevrolet','Onix',2013,2019,100000,999999,'transmissao','Câmbio automático com patinação','Marchas demoram ou não engajam. Revisão urgente antes que danos se agravem. Custo: R$ 2.000–5.000.','critical',2),
('Chevrolet','Onix',2013,2019,100000,999999,'carroceria','Ferrugem sob tapetes e no assoalho','Vazamentos de borracha comprometida apodrecem o assoalho. Verificar com a mão embaixo do tapete. Custo de reparo: R$ 800–2.500.','warn',3),
('Chevrolet','Onix',2013,2019,100000,999999,'suspensao','Pivôs e bandejas dianteiras gastos','Folga no volante e barulho em curva. Peças gastas comprometem geometria e pneus. Custo completo: R$ 900–2.000.','critical',4),

-- ──────────────────────────────────────────────
-- 3. HYUNDAI HB20 (2012–2019)
-- ──────────────────────────────────────────────
('Hyundai','HB20',2012,2019,0,30000,'motor','Consumo de óleo no motor 1.0','Motor com desgaste precoce de anéis em alguns lotes. Verificar nível a cada 2.000 km. Custo de reparo: R$ 2.000–4.500.','warn',1),
('Hyundai','HB20',2012,2019,0,30000,'eletrica','Central multimídia com tela piscando','Falha elétrica na unidade de infotainment — comum em HB20 2012–2015. Troca da central: R$ 800–2.000.','warn',2),
('Hyundai','HB20',2012,2019,0,30000,'suspensao','Barulho na suspensão dianteira','Estalos ao passar em lombada — buchas de bandeja com desgaste prematuro. Custo: R$ 300–600.','warn',3),

('Hyundai','HB20',2012,2019,30000,60000,'motor','Correia dentada — troca obrigatória','HB20 1.0 e 1.6 têm correia dentada. Ruptura = motor destruído instantaneamente. Custo da troca: R$ 500–800.','critical',1),
('Hyundai','HB20',2012,2019,30000,60000,'transmissao','Câmbio automático — solavanco','Troca de óleo ignorada causa choques nas trocas de marcha. Revisão: R$ 1.200–3.500.','warn',2),
('Hyundai','HB20',2012,2019,30000,60000,'freios','Discos traseiros com ferrugem superficial','HB20 com disco traseiro enferruja rápido. Verificar se há corrosão profunda — risco de travar a roda. Custo: R$ 300–550.','warn',3),
('Hyundai','HB20',2012,2019,30000,60000,'eletrica','Sensor de rotação com falha','Motor trepida e luz de motor acende. Sensor de rotação do virabrequim falha nessa faixa. Custo: R$ 200–450.','warn',4),

('Hyundai','HB20',2012,2019,60000,100000,'motor','Bomba de água com vazamento','Superaquecimento repentino — a bomba de água costuma vazar nessa faixa no HB20. Se ignorado, junta do cabeçote. Custo: R$ 400–800.','critical',1),
('Hyundai','HB20',2012,2019,60000,100000,'suspensao','Amortecedores dianteiros no limite','HB20 é leve e amortecedores sofrem com buracos. Verificar quique — reparo tardio danifica bandejas. Custo par: R$ 450–850.','warn',2),
('Hyundai','HB20',2012,2019,60000,100000,'eletrica','Módulo do air bag com falha','Luz de airbag acesa no painel é problema recorrente. Airbag inativo = risco de morte em colisão. Custo: R$ 500–1.200.','critical',3),
('Hyundai','HB20',2012,2019,60000,100000,'carroceria','Pintura com micro-bolhas','HB20 tem pintura fina — micro-bolhas indicam oxidação começando por baixo. Tratamento preventivo: R$ 300–600. Corretivo: R$ 1.500+.','warn',4),

('Hyundai','HB20',2012,2019,100000,999999,'motor','Junta do cabeçote comprometida','Histórico de superaquecimento nessa faixa. Fluido arrefecimento leitoso ou perda de pressão = junta rompida. Custo: R$ 1.500–3.000.','critical',1),
('Hyundai','HB20',2012,2019,100000,999999,'transmissao','Caixa automática com desgaste avançado','Solavanco e marcha "presa" indicam desgaste nos discos internos. Revisão completa: R$ 2.000–5.000.','critical',2),
('Hyundai','HB20',2012,2019,100000,999999,'suspensao','Kit suspensão dianteira completo','Pivôs, bandejas e buchas no limite de vida. Falha em alta velocidade é perigosa. Custo completo: R$ 1.200–2.500.','critical',3),
('Hyundai','HB20',2012,2019,100000,999999,'eletrica','Alternador com escovas gastas','Bateria não carrega direito — carro para na rua sem aviso. Custo de reparo ou troca: R$ 500–1.100.','warn',4),

-- ──────────────────────────────────────────────
-- 4. VOLKSWAGEN GOL (2008–2020)
-- ──────────────────────────────────────────────
('Volkswagen','Gol',2008,2020,0,30000,'motor','Consumo de óleo no 1.0 8v','Motor AP/EA111 consome óleo desde novo em alguns lotes. Verificar nível e cor. Custo de reparo: R$ 1.500–4.000.','warn',1),
('Volkswagen','Gol',2008,2020,0,30000,'eletrica','Painel de instrumentos instável','Velocímetro e marcadores oscilam — problema elétrico recorrente no Gol G5/G6. Custo: R$ 300–800.','warn',2),
('Volkswagen','Gol',2008,2020,0,30000,'carroceria','Ferrugem nos soleiros traseiros','Ponto fraco clássico do Gol — verificar com lanterna. Ferrugem estrutural compromete aprovação em vistoria. Custo: R$ 700–2.500.','warn',3),

('Volkswagen','Gol',2008,2020,30000,60000,'motor','Correia dentada EA111 — 1ª troca','Motor interferente: correia rompida = válvulas destruídas = motor fundido. Custo da troca: R$ 500–800. Custo do reparo sem troca: R$ 4.000–8.000.','critical',1),
('Volkswagen','Gol',2008,2020,30000,60000,'suspensao','Buchas de bandeja dianteira','Barulho em lombada e instabilidade em curva. Buchas de borracha enrijecem cedo no Gol. Custo: R$ 250–500.','warn',2),
('Volkswagen','Gol',2008,2020,30000,60000,'eletrica','Sensor MAP com falha','Engasgos e consumo alto — sensor de pressão do coletor falha entre 30k–60k. Custo: R$ 150–350.','warn',3),
('Volkswagen','Gol',2008,2020,30000,60000,'freios','Tambores traseiros com desgaste oval','Gol usa tambor traseiro — oval causa vibração e frenagem desigual. Tornear ou trocar. Custo: R$ 200–400.','warn',4),

('Volkswagen','Gol',2008,2020,60000,100000,'motor','2ª troca de correia dentada','Segunda troca vencida. Sem comprovante, o risco é imenso. Motor interferente não perdoa. Custo da troca: R$ 500–800.','critical',1),
('Volkswagen','Gol',2008,2020,60000,100000,'motor','Bomba d''água com desgaste','Superaquecimento repentino — bomba d''água do EA111 tem vida útil limitada. Custo: R$ 250–500.','critical',2),
('Volkswagen','Gol',2008,2020,60000,100000,'transmissao','Câmbio com ruído em neutro','Rolamento de entrada do câmbio com desgaste — chiado em ponto morto. Reparo tardio exige câmbio novo. Custo: R$ 800–2.500.','warn',3),
('Volkswagen','Gol',2008,2020,60000,100000,'carroceria','Ferrugem avançada em soleiros','Frequente nessa faixa — verificar extensão do dano. Ferrugem estrutural reduz valor e impede transferência limpa. Custo: R$ 1.000–3.500.','critical',4),

('Volkswagen','Gol',2008,2020,100000,999999,'motor','Motor AP no limite de vida','Acima de 100k o AP sem histórico de manutenção é incógnita. Barulho em marcha lenta = mancais. Custo de revisão: R$ 2.500–6.000.','critical',1),
('Volkswagen','Gol',2008,2020,100000,999999,'suspensao','Suspensão dianteira completamente gasta','Pivôs, amortecedores e bandejas no fim. Falha compromete estabilidade e aprovação em vistoria. Custo completo: R$ 1.200–2.800.','critical',2),
('Volkswagen','Gol',2008,2020,100000,999999,'eletrica','Fiação com ressecamento e falhas','Fiação antiga com isolante ressecado — curto-circuito pode causar incêndio elétrico. Revisão elétrica: R$ 400–1.000.','critical',3),

-- ──────────────────────────────────────────────
-- 5. FORD KA (2014–2020)
-- ──────────────────────────────────────────────
('Ford','Ka',2014,2020,0,30000,'motor','Ruído de corrente de distribuição','Ka 1.5 usa corrente — ruído metálico no arranque indica folga. Corrente rompida = motor fundido. Custo: R$ 800–1.500.','critical',1),
('Ford','Ka',2014,2020,0,30000,'eletrica','Câmera de ré com falha','Câmera de ré para de funcionar em modelos com multimídia. Custo de troca: R$ 300–700.','warn',2),
('Ford','Ka',2014,2020,0,30000,'transmissao','Câmbio PowerShift — comportamento errático','Ka com câmbio automático PowerShift tem histórico de solavanco desde 0 km. Problema estrutural de projeto. Custo de revisão: R$ 1.500–4.000.','critical',3),

('Ford','Ka',2014,2020,30000,60000,'motor','Vela de ignição com desgaste precoce','Motor 1.5 Ti-VCT com desgaste de velas antes dos 60k. Engasgos e consumo alto. Custo das 4 velas: R$ 200–400.','warn',1),
('Ford','Ka',2014,2020,30000,60000,'transmissao','PowerShift com solavanco nas marchas','Problema crônico na série — Ford fez recall mas não resolveu definitivamente. Solavanco piora com o tempo. Custo de revisão: R$ 1.500–4.500.','critical',2),
('Ford','Ka',2014,2020,30000,60000,'suspensao','Barra estabilizadora dianteira','Barulho em pavimento ruim — bieleta e bucha gastas. Custo: R$ 200–450.','warn',3),
('Ford','Ka',2014,2020,30000,60000,'freios','Pastilhas com desgaste acelerado','Ka tem freios subdimensionados para o peso. Pastilhas duram menos de 30k. Custo: R$ 200–380.','warn',4),

('Ford','Ka',2014,2020,60000,100000,'motor','Corrente de distribuição esticada','Barulho metálico no arranque piora com o tempo. Guia da corrente quebra e destrói o motor. Custo de reparo urgente: R$ 800–1.500.','critical',1),
('Ford','Ka',2014,2020,60000,100000,'transmissao','PowerShift com danos nos atuadores','Câmbio automático com danos progressivos nos atuadores hidráulicos. Revisão completa é cara. Custo: R$ 2.000–5.000.','critical',2),
('Ford','Ka',2014,2020,60000,100000,'suspensao','Amortecedores dianteiros gastos','Estabilidade comprometida. Ka leve sofre bastante com mau estado das vias. Custo par: R$ 400–750.','warn',3),
('Ford','Ka',2014,2020,60000,100000,'carroceria','Oxidação nos para-choques','Para-choques plástico com oxidação e microfissuras — substituto caro na Ford. Custo: R$ 400–900.','warn',4),

('Ford','Ka',2014,2020,100000,999999,'motor','Motor 1.5 com desgaste avançado','Motores sem revisão regular perdem compressão. Teste de compressão obrigatório acima de 100k. Custo de revisão: R$ 2.000–5.000.','critical',1),
('Ford','Ka',2014,2020,100000,999999,'transmissao','PowerShift inutilizável','Câmbio automático nessa faixa costuma estar no fim. Troca por câmbio recondicionado: R$ 3.500–7.000.','critical',2),
('Ford','Ka',2014,2020,100000,999999,'suspensao','Kit suspensão dianteira completo','Pivôs e bandejas no limite. Peças originais Ford são caras. Custo completo: R$ 1.200–2.500.','critical',3),

-- ──────────────────────────────────────────────
-- 6. FIAT ARGO (2017–2023)
-- ──────────────────────────────────────────────
('Fiat','Argo',2017,2023,0,30000,'motor','Ruído de tique-taque no motor 1.3','Motor GSE com barulho de tucho em funcionamento frio. Óleo inadequado agrava. Custo de regulagem: R$ 300–600.','warn',1),
('Fiat','Argo',2017,2023,0,30000,'eletrica','Multimídia Uconnect travando','Sistema trava e reinicia sozinho — problema de software comum. Atualização de firmware ou troca. Custo: R$ 0 (recall) a R$ 1.500.','warn',2),
('Fiat','Argo',2017,2023,0,30000,'suspensao','Barulho em curva — juntas dianteiras','Argo tem histórico de barulho nas juntas com menos de 20k km. Custo de troca: R$ 500–900.','warn',3),

('Fiat','Argo',2017,2023,30000,60000,'motor','Correia do alternador com desgaste','Correia fina do GSE desgasta rápido. Ruptura deixa o carro sem carga elétrica. Custo de troca: R$ 150–300.','warn',1),
('Fiat','Argo',2017,2023,30000,60000,'eletrica','Sensor de estacionamento defeituoso','Sensores de ré param de funcionar — chicote elétrico frágil no para-choque. Custo: R$ 200–500.','warn',2),
('Fiat','Argo',2017,2023,30000,60000,'freios','Discos dianteiros com empenamento','Frenagem com vibração indica disco empenado — problema registrado no Argo 1.8. Custo par: R$ 300–550.','warn',3),
('Fiat','Argo',2017,2023,30000,60000,'transmissao','Câmbio automático CVT — solavanco','CVT do Argo requer troca de óleo a cada 40k. Ignorado, patina e falha. Custo de revisão: R$ 600–2.500.','critical',4),

('Fiat','Argo',2017,2023,60000,100000,'motor','Bobinas de ignição com falha','Engasgo em uma cilindrada — bobina queimada é comum no 1.8 após 60k. Custo unitário: R$ 200–400.','warn',1),
('Fiat','Argo',2017,2023,60000,100000,'suspensao','Buchas de bandeja dianteira gastas','Barulho e folga no volante. Reposição: R$ 300–600.','warn',2),
('Fiat','Argo',2017,2023,60000,100000,'eletrica','Módulo de injeção com falha','Luz do motor acesa, falhas de leitura de sensores. Diagnóstico obrigatório. Custo: R$ 400–1.200.','warn',3),
('Fiat','Argo',2017,2023,60000,100000,'carroceria','Ferrugem nas bordas do teto','Argo tem relatos de oxidação nas bordas do teto entre calha e lataria. Corretivo precoce: R$ 400. Tardio: R$ 1.500+.','warn',4),

('Fiat','Argo',2017,2023,100000,999999,'motor','Corrente de distribuição com desgaste','Motor FireFly 1.3 usa corrente — barulho metálico no arranque indica folga. Custo: R$ 900–1.800.','critical',1),
('Fiat','Argo',2017,2023,100000,999999,'transmissao','CVT com desgaste avançado','CVT sem manutenção regular falha catastroficamente acima de 100k. Troca: R$ 4.000–8.000.','critical',2),
('Fiat','Argo',2017,2023,100000,999999,'suspensao','Suspensão dianteira completa no limite','Kit completo de pivôs e bandejas: R$ 1.000–2.200.','critical',3),

-- ──────────────────────────────────────────────
-- 7. JEEP RENEGADE (2015–2022)
-- ──────────────────────────────────────────────
('Jeep','Renegade',2015,2022,0,30000,'motor','Ruído de picada no motor 2.0 diesel','Motor diesel ECD com barulho de injetores em funcionamento frio. Injetores com defeito causam falha de injeção. Custo: R$ 800–2.500 por injetor.','critical',1),
('Jeep','Renegade',2015,2022,0,30000,'transmissao','Câmbio DDCT com solavanco desde 0','Câmbio de dupla embreagem tem solavanco estrutural — problema reconhecido pela Jeep. Custo de revisão: R$ 2.000–5.000.','critical',2),
('Jeep','Renegade',2015,2022,0,30000,'eletrica','Módulo de tração 4WD com falha','Sistema 4x4 falha aleatoriamente — luz de aviso acende. Custo: R$ 800–2.500.','warn',3),

('Jeep','Renegade',2015,2022,30000,60000,'motor','Vazamento de óleo na tampa de válvulas','Renegade 1.8 tem junta da tampa ressecando cedo. Óleo na correia = risco de ruptura. Custo: R$ 300–600.','critical',1),
('Jeep','Renegade',2015,2022,30000,60000,'transmissao','DDCT com desgaste nas embreagens','Embreagens secas desgastam rápido com tráfego urbano. Revisão antes que danifique a caixa. Custo: R$ 1.500–4.000.','critical',2),
('Jeep','Renegade',2015,2022,30000,60000,'suspensao','Juntas homocinéticas dianteiras','Renegade com tração integral sobrecarrega as juntas. Barulho em curva com carga. Custo: R$ 800–1.500.','warn',3),
('Jeep','Renegade',2015,2022,30000,60000,'eletrica','Infotainment UConnect com falhas','Tela trava, Bluetooth não conecta, sistema reinicia. Problema de firmware ou hardware. Custo: R$ 500–1.800.','warn',4),

('Jeep','Renegade',2015,2022,60000,100000,'motor','Correia dentada do motor 1.8 vencida','Motor interferente — ruptura funde o motor. Custo da troca: R$ 700–1.000. Custo do reparo sem troca: R$ 5.000–10.000.','critical',1),
('Jeep','Renegade',2015,2022,60000,100000,'transmissao','Caixa DDCT com danos nos atuadores','Renegade com câmbio DDCT nessa faixa frequentemente precisa de revisão geral. Custo: R$ 2.500–6.000.','critical',2),
('Jeep','Renegade',2015,2022,60000,100000,'carroceria','Ferrugem nos para-lamas traseiros','Pontos de solda expostos enferrujam. Custo de tratamento: R$ 600–1.800.','warn',3),
('Jeep','Renegade',2015,2022,60000,100000,'eletrica','Sensor de pressão dos pneus com falha','TPMS acende sem motivo — sensor com bateria fraca. Custo por sensor: R$ 150–300.','warn',4),

('Jeep','Renegade',2015,2022,100000,999999,'motor','Motor 2.0 diesel — injetores gastos','Injetores diesel com mais de 100k perdem precisão. Consumo sobe e fumaça preta aparece. Custo por injetor: R$ 800–2.500.','critical',1),
('Jeep','Renegade',2015,2022,100000,999999,'transmissao','DDCT inutilizável sem revisão','Acima de 100k sem revisão, o câmbio DDCT costuma ter danos irreversíveis. Troca: R$ 6.000–12.000.','critical',2),
('Jeep','Renegade',2015,2022,100000,999999,'suspensao','Suspensão traseira independente gasta','Sistema traseiro do Renegade é caro de repor. Custo completo: R$ 2.000–4.500.','critical',3),

-- ──────────────────────────────────────────────
-- 8. TOYOTA COROLLA (2008–2019)
-- ──────────────────────────────────────────────
('Toyota','Corolla',2008,2019,0,30000,'motor','Consumo de óleo 1ZZ-FE','Motor 1.8 1ZZ-FE tem histórico documentado de consumo elevado de óleo por desgaste de anéis. Custo de reparo: R$ 2.000–4.500.','warn',1),
('Toyota','Corolla',2008,2019,0,30000,'eletrica','Sonda lambda com falha precoce','Sonda lambda falha antes de 30k em alguns lotes. Consumo sobe e gatos motor acende. Custo: R$ 200–500.','warn',2),
('Toyota','Corolla',2008,2019,0,30000,'transmissao','Câmbio automático Super ECT','Câmbio automático Toyota é robusto mas exige troca de óleo a cada 40k. Ignorado, solavanco aparece cedo. Custo de manutenção: R$ 300.','warn',3),

('Toyota','Corolla',2008,2019,30000,60000,'motor','Correia dentada — troca obrigatória','Corolla 1.8 usa correia dentada. Motor interferente: ruptura = motor destruído. Custo da troca: R$ 600–900.','critical',1),
('Toyota','Corolla',2008,2019,30000,60000,'suspensao','Amortecedores dianteiros KYB','Amortecedores originais têm vida de 60k km. Troca preventiva mantém segurança. Custo par: R$ 600–1.000.','warn',2),
('Toyota','Corolla',2008,2019,30000,60000,'freios','Freios traseiros a tambor — desgaste oval','Tambores traseiros do Corolla ovalizam com freadas fortes. Tornear ou trocar. Custo: R$ 200–400.','warn',3),
('Toyota','Corolla',2008,2019,30000,60000,'eletrica','Módulo ABS com falha intermitente','Luz ABS acende e sistema desativa. Diagnóstico via scanner: R$ 100. Módulo: R$ 600–1.500.','warn',4),

('Toyota','Corolla',2008,2019,60000,100000,'motor','2ª correia dentada + bomba d''água','Troca conjunta recomendada. Bomba d''água desgasta no mesmo intervalo. Custo conjunto: R$ 900–1.400.','critical',1),
('Toyota','Corolla',2008,2019,60000,100000,'motor','Consumo de óleo agravado','1ZZ-FE com anéis desgastados consome 1L a cada 3.000 km. Fumaça azul no escapamento confirma. Custo de retífica: R$ 2.500–4.500.','critical',2),
('Toyota','Corolla',2008,2019,60000,100000,'suspensao','Buchas de bandeja dianteira','Borrachas envelhecidas causam barulho e instabilidade. Custo: R$ 350–700.','warn',3),
('Toyota','Corolla',2008,2019,60000,100000,'carroceria','Verniz com descascamento','Corolla de certas cores tem verniz frágil que descasca em áreas de exposição. Correção com polimento: R$ 400. Repintura: R$ 1.200+.','warn',4),

('Toyota','Corolla',2008,2019,100000,999999,'motor','Retífica do motor 1ZZ-FE','Com 100k+ o consumo de óleo por anéis desgastados é quase certo. Retífica completa: R$ 2.500–5.000.','critical',1),
('Toyota','Corolla',2008,2019,100000,999999,'transmissao','Câmbio automático com desgaste','Corolla com câmbio AT sem troca de óleo regular apresenta solavanco grave. Revisão: R$ 1.500–4.000.','warn',2),
('Toyota','Corolla',2008,2019,100000,999999,'suspensao','Kit suspensão dianteira completo','Acima de 100k, troca preventiva é mais barata que emergência. Custo completo: R$ 1.200–2.500.','warn',3),

-- ──────────────────────────────────────────────
-- 9. CHERY TIGGO T8 (2019–2023)
-- ──────────────────────────────────────────────
('Chery','Tiggo T8',2019,2023,0,30000,'eletrica','Sistema elétrico com falhas aleatórias','Tiggo T8 tem histórico de falhas elétricas intermitentes — painel, sensores e conectividade. Assistência técnica limitada no Brasil. Custo: R$ 500–2.000.','critical',1),
('Chery','Tiggo T8',2019,2023,0,30000,'transmissao','DCT 7 marchas — solavanco em baixa velocidade','Câmbio DCT com solavanco estrutural em manobras e tráfego lento. Problema conhecido da marca. Custo de revisão: R$ 1.500–4.000.','critical',2),
('Chery','Tiggo T8',2019,2023,0,30000,'motor','Consumo de combustível acima do prometido','Motor 1.5 turbo consome significativamente mais que os 10km/L prometidos no urbano. Verifique os dados reais antes de comprar.','warn',3),

('Chery','Tiggo T8',2019,2023,30000,60000,'motor','Correia acessórios com desgaste acelerado','Motor SQRE4T15C tem correia de acessórios com vida útil abaixo da média. Custo de troca: R$ 200–400.','warn',1),
('Chery','Tiggo T8',2019,2023,30000,60000,'transmissao','DCT — desgaste nas embreagens','Embreagens do DCT sofrem com tráfego urbano. Revisão preventiva imprescindível. Custo: R$ 1.500–4.500.','critical',2),
('Chery','Tiggo T8',2019,2023,30000,60000,'eletrica','Módulo TPMS e sensores','Falha nos sensores de pressão dos pneus — comum no Tiggo T8. Custo por sensor: R$ 200–400.','warn',3),
('Chery','Tiggo T8',2019,2023,30000,60000,'suspensao','Ruído na suspensão traseira independente','Barulho em pavimento irregular — buchas traseiras com desgaste precoce. Custo: R$ 400–900.','warn',4),

('Chery','Tiggo T8',2019,2023,60000,100000,'motor','Turbo com vazamento de óleo','Motor 1.5 turbo com vazamento pelo retorno do turbo após 60k. Ignorado danifica o motor. Custo: R$ 800–2.500.','critical',1),
('Chery','Tiggo T8',2019,2023,60000,100000,'eletrica','Central eletrônica com falhas graves','Tiggo T8 tem relatos de falhas na UCE que afetam freios, tração e direção. Peças importadas: R$ 2.000–5.000.','critical',2),
('Chery','Tiggo T8',2019,2023,60000,100000,'transmissao','DCT 7 marchas com falha catastrófica','Câmbio DCT com histórico de falha total nessa faixa sem manutenção. Troca: R$ 6.000–12.000.','critical',3),
('Chery','Tiggo T8',2019,2023,60000,100000,'carroceria','Ferrugem em solda do para-choque traseiro','Ponto de solda exposto enferruja e compromete estrutura do para-choque. Custo: R$ 400–900.','warn',4),

('Chery','Tiggo T8',2019,2023,100000,999999,'motor','Motor turbo com desgaste avançado','Turbo e motor 1.5 nessa faixa exigem revisão completa. Peças de reposição importadas são caras. Custo: R$ 3.000–8.000.','critical',1),
('Chery','Tiggo T8',2019,2023,100000,999999,'transmissao','DCT inutilizável','Câmbio DCT acima de 100k sem revisão geralmente precisa de troca completa. Custo: R$ 7.000–14.000.','critical',2),
('Chery','Tiggo T8',2019,2023,100000,999999,'eletrica','Módulos eletrônicos com falha múltipla','Múltiplos módulos falhando simultaneamente — problema estrutural da eletrônica Chery. Custo imprevisível: R$ 3.000–10.000.','critical',3),

-- ──────────────────────────────────────────────
-- 10. FIAT STRADA (2013–2022)
-- ──────────────────────────────────────────────
('Fiat','Strada',2013,2022,0,30000,'motor','Consumo de óleo no motor Fire 1.4','Motor Fire tem consumo leve de óleo desde novo. Se não monitorado, nível cai e motor trava. Custo de reparo: R$ 1.500–3.500.','warn',1),
('Fiat','Strada',2013,2022,0,30000,'carroceria','Ferrugem no chassi — uso off-road','Strada usada em estradas de terra tem pontos de ferrugem no chassi e na caçamba. Custo de tratamento: R$ 600–2.000.','warn',2),
('Fiat','Strada',2013,2022,0,30000,'eletrica','Painel com falha de leitura','Velocímetro e marcador de combustível oscilam — problema de fundo comum no painel Fiat. Custo: R$ 300–700.','warn',3),

('Fiat','Strada',2013,2022,30000,60000,'motor','Correia dentada Fire — 1ª troca','Motor Fire usa correia dentada interferente. Ruptura = motor destruído. Custo da troca: R$ 400–700.','critical',1),
('Fiat','Strada',2013,2022,30000,60000,'suspensao','Buchas de bandeja dianteira','Strada com uso misto (asfalto + terra) desgasta buchas rápido. Custo: R$ 250–500.','warn',2),
('Fiat','Strada',2013,2022,30000,60000,'freios','Tambores traseiros com desgaste','Strada usa tambor traseiro — ovalização em uso intenso com carga. Custo: R$ 200–400.','warn',3),
('Fiat','Strada',2013,2022,30000,60000,'carroceria','Caçamba com pontos de ferrugem','Verificar bordas da caçamba e dobradiças. Ferrugem avança rápido sem tratamento. Custo: R$ 400–1.200.','warn',4),

('Fiat','Strada',2013,2022,60000,100000,'motor','2ª correia dentada — troca vencida','Segunda troca obrigatória. Motor interferente não dá segunda chance. Custo: R$ 400–700.','critical',1),
('Fiat','Strada',2013,2022,60000,100000,'motor','Junta do cabeçote com risco','Motor Fire com superaquecimento (frequente em uso pesado) danifica a junta. Custo: R$ 1.200–2.500.','critical',2),
('Fiat','Strada',2013,2022,60000,100000,'suspensao','Amortecedores dianteiros no limite','Strada com carga frequente desgasta amortecedores antes dos 80k. Custo par: R$ 400–750.','warn',3),
('Fiat','Strada',2013,2022,60000,100000,'carroceria','Ferrugem estrutural no chassi','Uso em estradas de barro corrói o chassi. Inspeção embaixo do carro é obrigatória. Custo de recuperação: R$ 1.200–4.000.','critical',4),

('Fiat','Strada',2013,2022,100000,999999,'motor','Motor Fire com desgaste avançado','Acima de 100k, verificar compressão. Motor sem histórico de revisão é risco alto. Custo de retífica: R$ 2.000–4.500.','critical',1),
('Fiat','Strada',2013,2022,100000,999999,'suspensao','Kit suspensão dianteira completo','Pivôs, bandejas, amortecedores. Strada com uso intenso gasta tudo junto. Custo: R$ 1.000–2.200.','critical',2),
('Fiat','Strada',2013,2022,100000,999999,'carroceria','Chassi com ferrugem estrutural grave','Ferrugem no chassi acima de 100k em uso misto é quase certa. Pode reprovar em vistoria e comprometer a segurança. Custo: R$ 2.000–6.000.','critical',3),
('Fiat','Strada',2013,2022,100000,999999,'eletrica','Fiação do caminhão com ressecamento','Isolante elétrico ressecado em Stratas de trabalho — risco de curto e incêndio. Revisão elétrica: R$ 400–900.','critical',4);

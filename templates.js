// Modelos prontos de laudo (o médico edita o conteúdo depois de escolher)
const TEMPLATES = {
  ecodoppler: `ECO-DOPPLER VENOSO DE MEMBROS INFERIORES

MEMBRO INFERIOR DIREITO
- Veia safena magna: calibre ___ mm; refluxo ( ) ausente ( ) presente, duração ___ s.
- Veia safena parva: calibre ___ mm; refluxo ( ) ausente ( ) presente.
- Veias perfurantes insuficientes: ___
- Veias profundas: pérvias, compressíveis, sem sinais de trombose.
- Telangiectasias / microvarizes: ___

MEMBRO INFERIOR ESQUERDO
- Veia safena magna: calibre ___ mm; refluxo ( ) ausente ( ) presente, duração ___ s.
- Veia safena parva: calibre ___ mm; refluxo ( ) ausente ( ) presente.
- Veias perfurantes insuficientes: ___
- Veias profundas: pérvias, compressíveis, sem sinais de trombose.
- Telangiectasias / microvarizes: ___

CLASSIFICAÇÃO CEAP: ___

IMPRESSÃO / CONCLUSÃO
___`,

  microlaser: `PLANO DE TRATAMENTO — MICROLASER

Indicação: microvarizes e telangiectasias em membros inferiores.
Método: minimamente invasivo, com agulhas ultrafinas, guiado por realidade aumentada.

ACHADOS
- MID: veia(s) nutridora(s): ___ ; telangiectasias (diâmetro): ___ mm; região: ___
- MIE: veia(s) nutridora(s): ___ ; telangiectasias (diâmetro): ___ mm; região: ___

CONDUTA / FASES
- Fase 1 (Neutralização): neutralização da veia nutridora; sessões quinzenais.
- Fase 2 (Refinamento): ajuste dos detalhes, por sessão, até a satisfação.
- Fase 3 (Preventiva): acompanhamento.

OBSERVAÇÕES
Melhora esperada de até 70% na 1ª fase. Sem promessa de resultado definitivo.
___`,

  espuma: `PLANO DE TRATAMENTO — ESPUMA DENSA ECOGUIADA

Indicação: varizes / veias-alvo em membros inferiores.
Técnica: escleroterapia com espuma densa guiada por ultrassonografia.

VEIAS-ALVO
- MID: ___ (calibre ___ mm) — volume estimado: ___ mL
- MIE: ___ (calibre ___ mm) — volume estimado: ___ mL

CONDUTA
- Nº de aplicações previstas: ___
- Sessões de drenagem: ___
- Acompanhamento ultrassonográfico: ___

OBSERVAÇÕES
___`,

  endolaser: `PLANO DE TRATAMENTO — ENDOLASER (EVLA)

Indicação: insuficiência de veia safena / varizes calibrosas.

ACHADOS
- MID: safena ___ ; ponto de início da ablação: ___ cm; distância à junção: ___ cm; diâmetro: ___ mm.
- MIE: safena ___ ; ponto de início da ablação: ___ cm; distância à junção: ___ cm; diâmetro: ___ mm.

CONDUTA
- Endolaser de ___ até a junção ___ .
- Complementação (microvarizes / tributárias): ___
- Fibra / parâmetros: ___

OBSERVAÇÕES
Anestesia tumescente guiada por ultrassom. ___`
};

# Pense Bem — Disney: Viagem no Tempo

Esta é uma versão de trabalho do G2. O livro foi trocado para *Pense Bem — Disney: Viagem no Tempo*, com os programas 151–155 (30 questões cada). As 25 páginas de exercícios e a capa vieram do PDF do livro fornecido. O programa 156 não está incluído porque o formulário da atividade pede cinco programas.

## O que já funciona

- Seleção dos cinco programas, navegação pelas 150 questões e ampliação das páginas escaneadas.
- Modo de leitura sem gabarito: as alternativas não aceitam respostas e não são atribuídos pontos fictícios.
- Motor de três tentativas e pontuação 3/2/1/0, pronto para ser ativado quando as respostas reais forem cadastradas.
- `Snack-App.js` é a versão única para copiar para o Expo Snack; inclui a capa e as páginas em base64. O arquivo é grande (cerca de 12 MB), então a colagem pode levar tempo.

## Temas secretos

No navegador, pressione `Shift` e digite uma das sequências (até 6 segundos entre teclas):

| Sequência | Programa | Visual |
| --- | --- | --- |
| `ELO` | 151 · O elo perdido | Pré-história |
| `HISTORIA` | 152 · Viagem pela história | Extremo Oriente / China |
| `INVENTOS` | 153 · Inventos e civilizações | Era das invenções |
| `AMERICAS` | 154 · Povos das Américas | Américas |
| `EGITO` | 155 · Civilização egípcia | Egito Antigo |
| `ORIGINAL` | Qualquer | Volta ao visual padrão |

No celular, segure o nome de um programa para ativar seu tema; segure o logotipo Pense Bem para voltar ao visual padrão. O tema altera a aparência, não as respostas nem o progresso.

## Ainda falta antes da entrega

1. Enviar o gabarito dos programas 151–155 para preencher `answer` em `pense-bem-hercules/data.js` e validar as 150 respostas. Por enquanto todas são `null`.
2. Refazer o formulário/PDF da atividade para o novo livro e os códigos 151–155. Os arquivos `Formulario_G2_Hercules.pdf` e `Guia_Projeto_Hercules.pdf`, se presentes, pertencem à versão antiga e **não devem ser entregues** como documentação deste livro.
3. Informar nomes e matrículas, confirmar que nenhum outro grupo escolheu o mesmo livro, testar no Expo Go e publicar o link real do Snack. O prazo de apresentação no enunciado é 17/11/2026.

## Testes

Na pasta raiz, execute `npm --prefix .\pense-bem-hercules test`. Para a prévia local: entre em `pense-bem-hercules` e execute `npx expo start --web` (ou `npx expo start` para usar Expo Go).

Livro: *Pense Bem — Disney: Viagem no Tempo*. Material acadêmico sem vínculo oficial com Disney ou Tectoy.
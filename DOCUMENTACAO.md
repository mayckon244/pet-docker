# PetCare — Pet Shop Agenda

## O que foi melhorado
- Interface profissional e responsiva, inspirada em padrões de experiência usados por grandes pet shops como Cobasi e Petlove.
- Área de serviços com Banho & Tosa, Veterinário, Tosa higiênica e Cuidados pet.
- Formulário completo com tutor, telefone, pet, espécie, raça, serviço, data/hora e observações.
- Busca de agendamentos e contador de registros.
- Feedback visual de sucesso/erro sem depender apenas de alertas.
- Backend com validação dos campos obrigatórios e suporte às novas colunas do banco.
- Compatibilidade com o volume existente: o backend cria as novas colunas caso o banco já tenha sido criado em uma versão anterior.

## Docker
- Frontend: `8082`
- Backend: `3002`
- MySQL: banco `petshop`
- Rede: `rede-petshop`
- Volume: `dados_petshop`

## Executar
```bash
docker volume create dados_petshop
docker network create rede-petshop
docker compose up -d --build
```

Acesse: http://localhost:8082

## Persistência
Para testar: `docker compose down` e depois `docker compose up -d`. Não use `docker compose down -v` se quiser manter os dados do volume.

## Referências de inspiração
A organização de serviços e agendamento foi inspirada por funcionalidades públicas observadas em sites oficiais da Cobasi e Petlove. O código, textos e identidade visual deste projeto são próprios.

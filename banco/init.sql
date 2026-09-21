CREATE DATABASE IF NOT EXISTS petshop;
USE petshop;

CREATE TABLE IF NOT EXISTS agendamentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pet VARCHAR(255) NOT NULL,
    tutor VARCHAR(255) NOT NULL,
    telefone VARCHAR(30),
    especie VARCHAR(50) DEFAULT 'Cachorro',
    raca VARCHAR(120),
    servico VARCHAR(255),
    data_hora DATETIME,
    observacoes TEXT
);

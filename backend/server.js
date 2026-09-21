const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
const PORT = 3002;

app.use(cors());
app.use(express.json());

const banco = mysql.createPool({
    host: "banco",
    user: "root",
    password: "123456",
    database: "petshop",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

function prepararBanco() {
    const colunas = [
        ["telefone", "VARCHAR(30)"],
        ["especie", "VARCHAR(50) DEFAULT 'Cachorro'"],
        ["raca", "VARCHAR(120)"],
        ["observacoes", "TEXT"]
    ];

    return new Promise((resolve, reject) => {
        banco.query("CREATE TABLE IF NOT EXISTS agendamentos (id INT AUTO_INCREMENT PRIMARY KEY, pet VARCHAR(255) NOT NULL, tutor VARCHAR(255) NOT NULL, servico VARCHAR(255), data_hora DATETIME)", erro => {
            if (erro) return reject(erro);
            let pendentes = colunas.length;
            if (!pendentes) return resolve();
            colunas.forEach(([nome, tipo]) => {
                banco.query(`ALTER TABLE agendamentos ADD COLUMN ${nome} ${tipo}`, erroAlteracao => {
                    // ER_DUP_FIELDNAME (1060) significa que a coluna já existe.
                    if (erroAlteracao && erroAlteracao.code !== "ER_DUP_FIELDNAME") return reject(erroAlteracao);
                    pendentes -= 1;
                    if (pendentes === 0) resolve();
                });
            });
        });
    });
}

app.get("/", (req, res) => res.json({ sistema: "PetCare", status: "online" }));

app.get("/agendamentos", (req, res) => {
    banco.query("SELECT * FROM agendamentos ORDER BY data_hora IS NULL, data_hora ASC, id DESC", (erro, resultados) => {
        if (erro) return res.status(500).json({ erro: "Erro ao buscar agendamentos" });
        res.json(resultados);
    });
});

app.post("/agendamentos", (req, res) => {
    const { pet, tutor, telefone, especie, raca, servico, data_hora, observacoes } = req.body;

    if (!pet || !tutor || !telefone || !servico || !data_hora) {
        return res.status(400).json({ erro: "Preencha os campos obrigatórios." });
    }

    banco.query(
        `INSERT INTO agendamentos (pet, tutor, telefone, especie, raca, servico, data_hora, observacoes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [pet, tutor, telefone, especie || "Cachorro", raca || null, servico, data_hora, observacoes || null],
        (erro, resultado) => {
            if (erro) return res.status(500).json({ erro: "Erro ao salvar agendamento" });
            res.status(201).json({ mensagem: "Agendamento salvo", id: resultado.insertId });
        }
    );
});

prepararBanco()
    .then(() => app.listen(PORT, () => console.log(`Backend PetCare rodando na porta ${PORT}`)))
    .catch(erro => {
        console.error("Erro ao preparar o banco:", erro);
        process.exit(1);
    });

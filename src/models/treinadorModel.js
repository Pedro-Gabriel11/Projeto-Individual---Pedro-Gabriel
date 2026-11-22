let database = require("../database/config");

// ---------------- CONTA ----------------

function buscarPorUsuario(usuario) {
    let instrucaoSql = "SELECT id FROM treinador WHERE usuario = ?";
    return database.executar(instrucaoSql, [usuario]);
}

function buscarPorEmail(email) {
    let instrucaoSql = "SELECT id FROM treinador WHERE email = ?";
    return database.executar(instrucaoSql, [email]);
}

function cadastrar(nome, usuario, email, senha) {
    let instrucaoSql = "INSERT INTO treinador (nome, usuario, email, senha) VALUES (?, ?, ?, ?)";
    return database.executar(instrucaoSql, [nome, usuario, email, senha]);
}

// "conta" pode ser o e-mail ou o nome de treinador (usuario).
function autenticar(conta, senha) {
    let instrucaoSql = `
        SELECT id, nome, usuario, email FROM treinador
        WHERE (email = ? OR usuario = ?) AND senha = ?
    `;
    return database.executar(instrucaoSql, [conta, conta, senha]);
}

module.exports = {
    buscarPorUsuario,
    buscarPorEmail,
    cadastrar,
    autenticar
};

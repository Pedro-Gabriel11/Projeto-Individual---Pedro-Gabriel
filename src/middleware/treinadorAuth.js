var crypto = require("crypto");
var treinadorModel = require("../models/treinadorModel");

function autenticarTreinador(req, res, next) {
    var cabecalho = req.headers.authorization || "";
    var correspondencia = cabecalho.match(/^Bearer ([A-Za-z0-9_-]+)$/);

    if (!correspondencia) {
        return res.status(401).json({ mensagem: "Entre na sua conta para continuar." });
    }

    var tokenHash = crypto.createHash("sha256").update(correspondencia[1]).digest("hex");
    treinadorModel.buscarSessao(tokenHash)
        .then(function (treinador) {
            if (!treinador) {
                return res.status(401).json({ mensagem: "Sua sessão expirou. Entre novamente." });
            }
            req.treinador = treinador;
            req.tokenHash = tokenHash;
            next();
        })
        .catch(function (erro) {
            console.error("Erro ao validar sessão do treinador:", erro);
            res.status(500).json({ mensagem: "Não foi possível validar sua sessão." });
        });
}

module.exports = autenticarTreinador;

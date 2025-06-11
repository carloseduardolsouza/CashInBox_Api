const Usuario = require('../models/Usuario');
const bcrypt = require('bcrypt');

exports.getAllUsers = async (req, res) => {
  try {
    const usuarios = await Usuario.findAll();
    res.json(usuarios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { nome, email, senha_hash, role, ativo } = req.body;

    // Verificação básica
    if (!nome || !email || !senha_hash) {
      return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
    }

    const senhaCriptografada = await bcrypt.hash(senha_hash, 10);

    // Criando o usuário com os campos informados
    const novoUsuario = await Usuario.create({
      nome,
      email,
      senha_hash: senhaCriptografada,
      role: role || 'admin',
      ativo: ativo !== undefined ? ativo : true
    });

    res.status(201).json(novoUsuario);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
};

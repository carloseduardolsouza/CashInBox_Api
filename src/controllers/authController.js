const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
const Cliente = require('../models/Cliente');

const SECRET = process.env.JWT_SECRET || 'segreto';

exports.register = async (req, res) => {
  try {
    const { email, senha, cliente_id } = req.body;

    if (!email || !senha || !cliente_id) {
      return res.status(400).json({ erro: 'Campos obrigatórios ausentes' });
    }

    const cliente = await Cliente.findByPk(cliente_id);
    if (!cliente) return res.status(404).json({ erro: 'Cliente não encontrado' });

    const existente = await Usuario.findOne({ where: { email } });
    if (existente) return res.status(409).json({ erro: 'E-mail já registrado' });

    const senha_hash = await bcrypt.hash(senha, 10);

    const novo = await Usuario.create({ email, senha_hash, cliente_id });

    res.status(201).json({ id: novo.id, email: novo.email });
  } catch (e) {
    res.status(500).json({ erro: 'Erro interno', detalhes: e.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) return res.status(401).json({ erro: 'Credenciais inválidas' });

    const senhaConfere = await bcrypt.compare(senha, usuario.senha_hash);
    if (!senhaConfere) return res.status(401).json({ erro: 'Credenciais inválidas' });

    const token = jwt.sign(
      {
        id_usuario: usuario.id,
        role: usuario.role
      },
      SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token });
  } catch (e) {
    res.status(500).json({ erro: 'Erro interno', detalhes: e.message });
  }
};
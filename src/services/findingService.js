const findingRepository = require('../repositories/findingRepository')

const getAllFinding = async () => {
  return findingRepository.findAll();
};

const getById = async (id) => {
  return findingRepository.findById(id);
};

const create = async (finding) => {
  return findingRepository.create(finding);
};

const deleteById = async (id) => {
  return findingRepository.deleteById(id);
};

module.exports = { getAllFinding, getById, create, deleteById };
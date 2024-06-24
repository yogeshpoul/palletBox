// src/CubeScene.js
import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { Box } from '@react-three/drei';
import axios from 'axios';
import Modal from 'react-modal';

Modal.setAppElement('#root');

const CubeScene = () => {
  const [cubes, setCubes] = useState([]);
  const [palletSize, setPalletSize] = useState({ width: 10, length: 10 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCube, setCurrentCube] = useState(null);

  useEffect(() => {
    const fetchCubes = async () => {
      const response = await axios.get('http://localhost:5006/cubes');
      setCubes(response.data);
    };
    fetchCubes();
  }, []);

  const handleAddCube = async (e) => {
    e.preventDefault();
    const width = parseFloat(e.target.width.value);
    const height = parseFloat(e.target.height.value);
    const length = parseFloat(e.target.length.value);
    const caseName = e.target.caseName.value;
    const mass = parseFloat(e.target.mass.value);

    const newCube = { width, height, length, caseName, mass };
    const response = await axios.post('http://localhost:5006/cube', newCube);
    setCubes([...cubes, response.data]);
    e.target.reset();
  };

  const handleDeleteCube = async (id) => {
    await axios.delete(`http://localhost:5006/cube/${id}`);
    setCubes(cubes.filter(cube => cube.id !== id));
  };

  const handleUpdateCube = async (e) => {
    e.preventDefault();
    const updatedCube = {
      ...currentCube,
      width: parseFloat(e.target.width.value),
      height: parseFloat(e.target.height.value),
      length: parseFloat(e.target.length.value),
      caseName: e.target.caseName.value,
      mass: parseFloat(e.target.mass.value),
    };

    const response = await axios.put(`http://localhost:5006/cube/${currentCube.id}`, updatedCube);
    setCubes(cubes.map(cube => (cube.id === currentCube.id ? response.data : cube)));
    setIsModalOpen(false);
  };

  const handleEditCube = (cube) => {
    setCurrentCube(cube);
    setIsModalOpen(true);
  };

  const handlePalletSizeChange = (e) => {
    const [width, length] = e.target.value.split('x').map(Number);
    setPalletSize({ width, length });
  };

  return (
    <div>
      <form onSubmit={handleAddCube}>
        <input type="number" name="width" placeholder="Width" step="0.1" required />
        <input type="number" name="height" placeholder="Height" step="0.1" required />
        <input type="number" name="length" placeholder="Length" step="0.1" required />
        <input type="number" name="mass" placeholder="Mass" step="0.1" required />
        <input type="text" name="caseName" placeholder="Case Name" required />
        <button type="submit">Add Cube</button>
      </form>

      <div>
        <label>Pallet Size: </label>
        <select onChange={handlePalletSizeChange}>
          <option value="10x10">Standard (10x10)</option>
          <option value="12x12">Large (12x12)</option>
          <option value="8x8">Small (8x8)</option>
        </select>
      </div>

      <Canvas style={{ height: 600 }}>
        <ambientLight />
        <pointLight position={[10, 10, 10]} />
        <OrbitControls />
        <Pallet size={palletSize} />
        {cubes.map((cube, index) => (
          <Cube key={cube.id} {...cube} index={index} palletSize={palletSize} onDelete={() => handleDeleteCube(cube.id)} onEdit={() => handleEditCube(cube)} />
        ))}
      </Canvas>

      {isModalOpen && (
        <Modal isOpen={isModalOpen} onRequestClose={() => setIsModalOpen(false)}>
          <form onSubmit={handleUpdateCube}>
            <input type="number" name="width" defaultValue={currentCube.width} step="0.1" required />
            <input type="number" name="height" defaultValue={currentCube.height} step="0.1" required />
            <input type="number" name="length" defaultValue={currentCube.length} step="0.1" required />
            <input type="number" name="mass" defaultValue={currentCube.mass} step="0.1" required />
            <input type="text" name="caseName" defaultValue={currentCube.caseName} required />
            <button type="submit">Update Cube</button>
          </form>
        </Modal>
      )}
    </div>
  );
};

const Pallet = ({ size }) => {
  return (
    <Box args={[size.width, 0.5, size.length]} position={[0, -0.25, 0]}>
      <meshStandardMaterial attach="material" color="brown" />
    </Box>
  );
};

const Cube = ({ id, width, height, length, caseName, mass, index, palletSize, onDelete, onEdit }) => {
  const gap = 0.1;
  const columns = Math.floor(palletSize.width / (width + gap));
  const x = (index % columns) * (width + gap) - palletSize.width / 2 + width / 2;
  const z = Math.floor(index / columns) * (length + gap) - palletSize.length / 2 + length / 2;

  return (
    <group position={[x, height / 2, z]}>
      <Box args={[width, height, length]}>
        <meshStandardMaterial attach="material" color="orange" />
      </Box>
      <Text position={[0, height / 2 + 0.1, 0]} fontSize={0.5} color="black">
        {caseName}
      </Text>
      <Text position={[0, -height / 2 - 0.1, 0]} fontSize={0.3} color="black">
        {mass}kg
      </Text>
      <mesh position={[0.3, height / 2 + 0.3, 0]} onClick={onEdit}>
        <boxGeometry args={[0.5, 0.1, 0.5]} />
        <meshStandardMaterial color="blue" />
        <Text position={[0, 0, 0]} fontSize={0.2} color="white">
          Edit
        </Text>
      </mesh>
      <mesh position={[0.3, height / 2 + 0.5, 0]} onClick={onDelete}>
        <boxGeometry args={[0.5, 0.1, 0.5]} />
        <meshStandardMaterial color="red" />
        <Text position={[0, 0, 0]} fontSize={0.2} color="white">
          Delete
        </Text>
      </mesh>
    </group>
  );
};

export default CubeScene;

import React from 'react';

const Greeting = ({ name = 'Mundo' }) => {
  return <h1>Hola, {name}!</h1>;
};

export default Greeting;
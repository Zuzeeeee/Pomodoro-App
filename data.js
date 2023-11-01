const save = (ev, value) => {
  localStorage.setItem(ev,value);
}

const fetchData = async (key) => {
  return localStorage.getItem(key);
}

export {save, fetchData};
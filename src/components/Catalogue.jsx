import React, { useEffect, useState } from 'react';
import axios from 'axios';
import config from '../config';
import { useAuth, useReAuth } from '../customHooks';
import { getDataFromResp } from '../helpers';

import { makeStyles } from '@material-ui/core/styles';
import { Link } from 'react-router-dom';
import NativeSelect from '@material-ui/core/NativeSelect';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';
import Button from '@material-ui/core/Button';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Paper from '@material-ui/core/Paper';

const useStyles = makeStyles(theme => ({
  loading: {
    marginTop: 100
  },
  catalogue: {
    textAlign: 'center'
  },
  catalogueContent: {
    margin: '0 30px',
    display: 'grid',
    justifyContent: 'space-around',
    gridGap: 30,
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 280px))'
  },
  link: {
    textDecoration: 'none'
  },
  formControl: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'flex-end',
    margin: '0 100px',
    minWidth: 120,
  },
  filterForm: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(145px, 1fr))',
    gridGap: 30
  },
  filterFormBtn: {
    height: 40,
    alignSelf: 'center'
  },
  controls: {
    display: 'flex',
    flexWrap: 'wrap',
    margin: '20px 30px'
  },
  filterFormPaper: {
    flexGrow: 1,
    padding: '10px 20px',
    marginRight: 30,
    maxWidth: '100%',
    [theme.breakpoints.down(1200)]: {
      margin: 0,
    },
  },
  sortPaper: {
    padding: '10px 20px',
    width: 150,
    [theme.breakpoints.down(1200)]: {
      flexBasis: '100%',
      marginTop: 20
    }
  },
  sortFormControl: {
    width: 150
  }
}));

function Catalogue() {
  const { apiUrlBase } = config;
  const activeFilters = JSON.parse(sessionStorage.getItem('requestFilters')) || {};
  const classes = useStyles();
  const { isAuthLoading, isAuthError } = useAuth();
  const { isReAuthLoading, isReAuthError, setDoReAuth } = useReAuth();
  const [people, setPeople] = useState();
  const [peopleLoading, setPeopleLoading] = useState(false);
  const [peopleError, setPeopleError] = useState(false);
  const [sortRule, setSortRule] = useState(sessionStorage.getItem('sortRule') || 'name-asc');
  const [filterValues, setFilterValues] = useState(activeFilters);
  const [requestFilters, setRequestFilters] = useState(activeFilters);
  const accessToken = localStorage.getItem('accessToken');

  useEffect(() => {
    const getPeople = async () => {
      let url = `${apiUrlBase}ds/people?outputs=["id", "name", "species", "gender", "birth_year", "image_url"]`;
      for (let key in requestFilters) {
        url += `&cond=[{"field":"${key}"},"=","${requestFilters[key]}"]`
      }
      const [field, direction] = sortRule.split('-');
      url += `&order={"direction":"${direction}","fields":["${field}"]}`;
      setPeopleLoading(true);
      try {
        const newRecords = getDataFromResp({
          response: await axios.get(url, { headers: { Authorization: `Bearer ${accessToken}` } }),
          singleRecord: false
        });
        setPeople(newRecords);
        setPeopleLoading(false);
      } catch (error) {
        if (error && error.response && error.response.status === 401 && localStorage.getItem('refreshToken')) {
          setDoReAuth(true);
        } else {
          setPeopleError(true);
        }
        setPeopleLoading(false);
      }
    };
    if (accessToken) getPeople();
  }, [accessToken, sortRule, requestFilters, setDoReAuth, apiUrlBase]);

  function getCatalogueData() {
    if (isAuthLoading || isReAuthLoading || peopleLoading) return <CircularProgress size={80} className={classes.loading} />;
    if (isAuthError || isReAuthError) return <p>Error in Auth</p>;
    if (peopleError) return <p>Error getting people</p>;
    if (people && Array.isArray(people)) {
      if (people.length === 0) return <div>No data in the catalogue!</div>;
      return (
        <div id="catalogue-content" className={classes.catalogueContent}>
          {people.map(p => (
            <Link to={`/person/${p.id}`} key={p.id} className={classes.link}>
              <Card className={classes.card}>
                <CardActionArea>
                  <CardMedia component="img" image={p.image_url} alt={p.name} title={p.name} />
                  <CardContent>
                    <Typography gutterBottom variant="h5" component="h2">
                      {p.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" component="p">
                      Species: {p.species}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" component="p">
                      Gender: {p.gender}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" component="p">
                      Birth year (C.R.C): {p.birth_year}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Link>
          ))}
        </div>
      );
    }
  }

  function handleSortByChange(e) {
    setSortRule(e.target.value);
    sessionStorage.setItem('sortRule', e.target.value);
  }

  function handleFilterValuesChange(e) {
    let newFilterValues = { ...filterValues };
    if (e.target.value === '') {
      delete newFilterValues[e.target.name];
    } else {
      newFilterValues = { ...newFilterValues, [e.target.name]: e.target.value };
    }

    setFilterValues(newFilterValues);
  }

  function filterPeople() {
    let newRequestFilters = { ...filterValues };
    setRequestFilters(newRequestFilters);
    sessionStorage.setItem('requestFilters', JSON.stringify(newRequestFilters));
  }

  function clearFilters() {
    setFilterValues({});
    setRequestFilters({});
    sessionStorage.setItem('requestFilters', JSON.stringify({}));
  }

  function getFilterForm() {
    return (
      <form noValidate autoComplete="off" className={classes.filterForm}>
        <FormControl className={classes.filterFormControl}>
          <InputLabel htmlFor="planet-filter">Planet</InputLabel>
          <NativeSelect id="planet-filter" name="planet_id" onChange={handleFilterValuesChange} value={filterValues.planet_id || ''}>
            <option aria-label="None" value="" />
            <option value="6515c2ef-38cd-4aef-bac4-b0eafed6c38b">Tatooine</option>
            <option value="19e367c8-566d-4dad-a694-ae6c1fb866ed">Stewjon</option>
            <option value="93c226ae-e5cd-4a3b-8c32-f87288958385">Naboo</option>
            <option value="1459efde-76a9-44e6-ac99-242c66b9ede2">Coruscant</option>
          </NativeSelect>
        </FormControl>
        <FormControl className={classes.filterFormControl}>
          <InputLabel htmlFor="gender-filter">Gender</InputLabel>
          <NativeSelect id="gender-filter" name="gender" onChange={handleFilterValuesChange} value={filterValues.gender || ''}>
            <option aria-label="None" value="" />
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </NativeSelect>
        </FormControl>
        <FormControl className={classes.filterFormControl}>
          <InputLabel htmlFor="species-filter">Species</InputLabel>
          <NativeSelect id="species-filter" name="species" onChange={handleFilterValuesChange} value={filterValues.species || ''}>
            <option aria-label="None" value="" />
            <option value="human">Human</option>
            <option value="gungan">Gungan</option>
            <option value="droid">Droid</option>
            <option value="yoda">Yoda</option>
          </NativeSelect>
        </FormControl>
        {Object.keys(requestFilters).length > 0 && <Button variant="contained" color="secondary" className={classes.filterFormBtn} onClick={clearFilters}>Clear Filters</Button>}
        <Button variant="contained" color="primary" className={classes.filterFormBtn} onClick={filterPeople} disabled={Object.keys(filterValues).length === 0}>Filter</Button>
      </form>
    )
  }

  return (
    <main id="catalogue" className={classes.catalogue}>
      <div id="controls" className={classes.controls}>
        <Paper elevation={5} className={classes.filterFormPaper}>
          {getFilterForm()}
        </Paper>
        <Paper elevation={5} className={classes.sortPaper}>
          <FormControl className={classes.sortFormControl}>
            <InputLabel htmlFor="sort-by">Sort by</InputLabel>
            <NativeSelect id="sort-by" onChange={handleSortByChange} value={sortRule}>
              <option value="name-asc">Name Asc</option>
              <option value="name-desc">Name Desc</option>
              <option value="birth_year-asc">Birth Year Asc</option>
              <option value="birth_year-desc">Birth Year Desc</option>
            </NativeSelect>
          </FormControl>
        </Paper>
      </div>
      {getCatalogueData()}
    </main>
  );
}

export default Catalogue;

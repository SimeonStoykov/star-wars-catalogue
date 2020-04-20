import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import config from '../config';
import { useAuth, useReAuth } from '../customHooks';
import { getDataFromResp } from '../helpers';

import { makeStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import Paper from '@material-ui/core/Paper';
import { Link } from 'react-router-dom';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles(theme => ({
  personContent: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center'
  },
  personImage: {
    width: 350,
    [theme.breakpoints.down(390)]: {
      width: 280
    }
  },
  paperTitle: {
    padding: '7px 0'
  },
  otherCharactersTitle: {
    margin: '20px 0',
    padding: '7px 0'
  },
  personH1: {
    margin: 0
  },
  personInfoPaper: {
    padding: '0 20px',
    flex: 1,
    maxHeight: 350,
    overflow: 'auto',
    [theme.breakpoints.down(900)]: {
      flexBasis: '100%',
      marginTop: 20,
      maxHeight: 500
    }
  },
  loading: {
    marginTop: 100
  },
  peopleOnTheSamePlanetLoading: {
    marginTop: 20,
    marginBottom: 30
  },
  peopleOnTheSamePlanetContent: {
    display: 'grid',
    gridGap: 20,
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 250px))'
  },
  link: {
    textDecoration: 'none'
  },
  personMain: {
    display: 'grid',
    gridGap: 20,
    margin: '20px 80px',
    justifyContent: 'center',
    [theme.breakpoints.down(1200)]: {
      margin: '20px 50px'
    },
    [theme.breakpoints.down(768)]: {
      margin: '20px 20px'
    }
  }
}));

function Person() {
  const { apiUrlBase } = config;
  const classes = useStyles();
  const { isAuthLoading, isAuthError } = useAuth();
  const { isReAuthLoading, isReAuthError, setDoReAuth } = useReAuth();
  const { id } = useParams();
  const [person, setPerson] = useState();
  const [peopleOnTheSamePlanet, setPeopleOnTheSamePlanet] = useState();
  const [isPersonLoading, setIsPersonLoading] = useState(false);
  const [isPersonError, setIsPersonError] = useState(false);
  const [isPeopleOnTheSamePlanetLoading, setIsPeopleOnTheSamePlanetLoading] = useState(false);
  const [isPeopleOnTheSamePlanetError, setIsPeopleOnTheSamePlanetError] = useState(false);
  const accessToken = localStorage.getItem('accessToken');

  useEffect(() => {
    const getPerson = async () => {
      setIsPersonLoading(true);
      try {
        const person = getDataFromResp({
          response: await axios
            .get(`${apiUrlBase}ds/people?cond=[{"field":"id"},"=","${id}"]`, {
              headers: { "Authorization": `Bearer ${accessToken}` }
            })
        });
        const planet = getDataFromResp({
          response: await axios
            .get(`${apiUrlBase}ds/planets?cond=[{"field":"id"},"=","${person.planet_id}"]`, {
              headers: { "Authorization": `Bearer ${accessToken}` }
            })
        });
        setPerson({ ...person, planetName: planet.name });
        setIsPersonLoading(false);
      } catch (error) {
        if (error && error.response && error.response.status === 401 && localStorage.getItem('refreshToken')) {
          setDoReAuth(true);
        } else {
          setIsPersonError(true);
        }
        setIsPersonLoading(false);
      }
    };

    if (accessToken) getPerson();
  }, [accessToken, id, setDoReAuth, apiUrlBase]);

  useEffect(() => {
    const getPeopleOnTheSamePlanet = async () => {
      setIsPeopleOnTheSamePlanetLoading(true);
      try {
        const peopleOnTheSamePlanet = getDataFromResp({
          response: await axios
            .get(`${apiUrlBase}ds/people?cond=[{"field":"id"}, "!=", "${person.id}"]&cond=[{"field":"planet_id"},"=","${person.planet_id}"]&outputs=["id", "name", "image_url"]`, {
              headers: { "Authorization": `Bearer ${localStorage.getItem("accessToken")}` }
            }),
          singleRecord: false
        });
        setPeopleOnTheSamePlanet(peopleOnTheSamePlanet);
        setIsPeopleOnTheSamePlanetLoading(false);
      } catch (error) {
        if (error && error.response && error.response.status === 401 && localStorage.getItem('refreshToken')) {
          setDoReAuth(true);
        } else {
          setIsPeopleOnTheSamePlanetError(true);
        }
        setIsPeopleOnTheSamePlanetLoading(false);
      }
    };

    if (person) getPeopleOnTheSamePlanet();
  }, [person, setDoReAuth, apiUrlBase]);

  function getPeopleOnTheSamePlanet() {
    if (isPeopleOnTheSamePlanetLoading) return <CircularProgress size={80} className={classes.peopleOnTheSamePlanetLoading} />;
    if (isPeopleOnTheSamePlanetError) return <div>Error getting people on the same planet!</div>;
    if (peopleOnTheSamePlanet && peopleOnTheSamePlanet.length > 0) {
      return (
        <React.Fragment>
          <Paper elevation={5} className={classes.paperTitle}>
            <h1 className={classes.personH1}>Other people from {person.planetName}</h1>
          </Paper>
          <div className={classes.peopleOnTheSamePlanetContent}>
            {peopleOnTheSamePlanet.map(p => (
              <Link to={`/person/${p.id}`} key={p.id} className={classes.link}>
                <Card className={classes.card}>
                  <CardActionArea>
                    <CardMedia component="img" image={p.image_url} alt={p.name} title={p.name} />
                    <CardContent>
                      <Typography gutterBottom variant="h5" component="h2">
                        {p.name}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Link>
            ))}
          </div>
        </React.Fragment>
      );
    }
  }

  function getPersonData() {
    if (isAuthLoading || isReAuthLoading || isPersonLoading) return <CircularProgress size={80} className={classes.loading} />;
    if (isAuthError || isReAuthError) return <p>Error in Auth</p>;
    if (isPersonError) return <p>Error getting people</p>;
    if (person) {
      return (
        <React.Fragment>
          <Paper elevation={5} className={classes.paperTitle}>
            <h1 className={classes.personH1}>{person.name}</h1>
          </Paper>
          <div className={classes.personContent}>
            <img src={person.image_url} alt={person.name} title={person.name} className={classes.personImage} />
            <Paper elevation={5} className={classes.personInfoPaper}>
              <p><strong>Species:</strong> {person.species}</p>
              <p><strong>Gender:</strong> {person.gender}</p>
              <p><strong>Birth year:</strong> {person.birth_year}</p>
              <p><strong>Planet:</strong> {person.planetName}</p>
              <p className={classes.personInfoText}>{person.info}</p>
            </Paper>
          </div>
          {getPeopleOnTheSamePlanet()}
        </React.Fragment>
      );
    }
    return null;
  }
  return <main className={classes.personMain}>{getPersonData()}</main>;
}

export default Person;

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import CustomPropTypes from '../app/utilities/props';
import { withRouter } from 'react-router';
import AssessmentEditPage from './components/AssessmentEditPage';
import ComplianceReportTabs from './components/ComplianceReportTabs';
import ROUTES_COMPLIANCE from '../app/routes/Compliance';
import Loading from '../app/components/Loading';
import CONFIG from '../app/config';

const AssessmentEditContainer = (props) => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState({});
  const [makes, setMakes] = useState([]);
  const [supplierMakes, setSupplierMakes] = useState([]);
  const [make, setMake] = useState('');
  const [modelYear, setModelYear] = useState(
    CONFIG.FEATURES.MODEL_YEAR_REPORT.DEFAULT_YEAR
  );
  const { user, keycloak } = props;
  const [statuses, setStatuses] = useState({
    assessment: {
      status: 'UNSAVED',
      confirmedBy: null,
    },
  });

  const handleChangeMake = (event) => {
    const { value } = event.target;
    setMake(value.toUpperCase());
  };

  const handleDeleteMake = (index) => {
    makes.splice(index, 1);
    setMakes([...makes]);
  };

  const handleSubmitMake = (event) => {
    event.preventDefault();

    setMake('');
    setMakes([...makes, make]);
  };

  const handleSubmit = (event) => {
    console.log('what is happening?');
    event.preventDefault();

    const data = {
      makes,
    };

    axios.patch(
      ROUTES_COMPLIANCE.REPORT_ASSESSMENT_SAVE.replace(/:id/g, id),
      data
    );
  };

  const refreshDetails = () => {
    axios
      .get(ROUTES_COMPLIANCE.REPORT_DETAILS.replace(/:id/g, id))
      .then((response) => {
        const {
          makes: modelYearReportMakes,
          modelYear: reportModelYear,
          statuses: reportStatuses,
          modelYearReportHistory,
          modelYearReportAddresses,
          organizationName,
          validationStatus,
        } = response.data;
        const year = parseInt(reportModelYear.name, 10);

        setModelYear(year);
        setStatuses(reportStatuses);
        if (modelYearReportMakes) {
          const currentMakes = modelYearReportMakes.map((each) => each.make);

          setMakes(currentMakes);
          setSupplierMakes(currentMakes);
        }

        setDetails({
          assessment: {
            history: modelYearReportHistory,
            validationStatus,
          },
          organization: {
            name: organizationName,
            organizationAddress: modelYearReportAddresses,
          },
          supplierInformation: {
            history: modelYearReportHistory,
            validationStatus,
          },
        });

        setLoading(false);
      });
  };

  useEffect(() => {
    refreshDetails(true);
  }, [keycloak.authenticated]);

  if (loading) {
    return <Loading />;
  }
  return (
    <>
      <ComplianceReportTabs
        active="assessment"
        reportStatuses={statuses}
        id={id}
        user={user}
      />
      <AssessmentEditPage
        modelYear={modelYear}
        statuses={statuses}
        id={id}
        loading={loading}
        user={user}
        makes={makes}
        details={details}
        handleChangeMake={handleChangeMake}
        handleDeleteMake={handleDeleteMake}
        handleSubmitMake={handleSubmitMake}
        make={make}
        handleSubmit={handleSubmit}
        supplierMakes={supplierMakes}
      />
    </>
  );
};
AssessmentEditContainer.propTypes = {
  user: CustomPropTypes.user.isRequired,
  keycloak: CustomPropTypes.keycloak.isRequired,
};
export default withRouter(AssessmentEditContainer);

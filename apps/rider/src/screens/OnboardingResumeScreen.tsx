import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useOnboardingStore } from '../store/onboardingStore';
import { ResumeOnboarding } from '../components/onboarding/ResumeOnboarding';
import { Colors } from '../theme';

export const OnboardingResumeScreen = ({ navigation }: any) => {
  const {
    applicationId,
    completionPercentage,
    sectionStatus,
    rejectionReason,
    loadOnboardingState,
  } = useOnboardingStore();

  useEffect(() => {
    loadOnboardingState();
  }, []);

  const handleSelectStep = (stepNumber: number) => {
    switch (stepNumber) {
      case 2:
        navigation.navigate('OnboardingPersonal');
        break;
      case 3:
        navigation.navigate('OnboardingAddress');
        break;
      case 4:
        navigation.navigate('OnboardingEmergencyContact');
        break;
      case 5:
        navigation.navigate('OnboardingVehicle');
        break;
      case 6:
        navigation.navigate('OnboardingIdentity');
        break;
      case 7:
        navigation.navigate('OnboardingDrivingLicence');
        break;
      case 8:
        navigation.navigate('OnboardingVehicleDocuments');
        break;
      case 9:
        navigation.navigate('OnboardingBanking');
        break;
      case 10:
        navigation.navigate('OnboardingServiceArea');
        break;
      case 11:
        navigation.navigate('OnboardingPreferences');
        break;
      case 12:
        navigation.navigate('OnboardingAvailability');
        break;
      case 13:
      case 14:
      default:
        navigation.navigate('OnboardingReview');
        break;
    }
  };

  const handleResume = () => {
    if (sectionStatus.PERSONAL !== 'COMPLETED') {
      navigation.navigate('OnboardingPersonal');
    } else if (sectionStatus.ADDRESS !== 'COMPLETED') {
      navigation.navigate('OnboardingAddress');
    } else if (sectionStatus.EMERGENCY_CONTACT !== 'COMPLETED') {
      navigation.navigate('OnboardingEmergencyContact');
    } else if (sectionStatus.VEHICLE !== 'COMPLETED') {
      navigation.navigate('OnboardingVehicle');
    } else if (sectionStatus.IDENTITY !== 'COMPLETED') {
      navigation.navigate('OnboardingIdentity');
    } else if (sectionStatus.DRIVING_LICENSE !== 'COMPLETED') {
      navigation.navigate('OnboardingDrivingLicence');
    } else if (sectionStatus.VEHICLE_DOCUMENTS !== 'COMPLETED') {
      navigation.navigate('OnboardingVehicleDocuments');
    } else if (sectionStatus.BANKING !== 'COMPLETED') {
      navigation.navigate('OnboardingBanking');
    } else if (sectionStatus.SERVICE_AREA !== 'COMPLETED') {
      navigation.navigate('OnboardingServiceArea');
    } else if (sectionStatus.DELIVERY_PREFERENCES !== 'COMPLETED') {
      navigation.navigate('OnboardingPreferences');
    } else if (sectionStatus.AVAILABILITY !== 'COMPLETED') {
      navigation.navigate('OnboardingAvailability');
    } else {
      navigation.navigate('OnboardingReview');
    }
  };

  return (
    <View style={styles.container}>
      <ResumeOnboarding
        applicationId={applicationId}
        completionPercentage={completionPercentage}
        sectionStatus={sectionStatus}
        rejectionReason={rejectionReason}
        onSelectStep={handleSelectStep}
        onResume={handleResume}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
});

export default OnboardingResumeScreen;

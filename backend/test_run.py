from features.analysis.seed import seed_data, get_companies, get_rse_scores, get_pollution_metrics
from features.analysis.service import get_dashboard_summary

if __name__ == '__main__':
    print('Seeding...')
    print(seed_data())
    print('Companies:', len(get_companies()))
    print('RSE scores:', len(get_rse_scores()))
    print('Pollution metrics:', len(get_pollution_metrics()))
    print('\nDashboard summary:')
    print(get_dashboard_summary())
